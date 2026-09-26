import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';
import { deleteReplacedMedia } from '../common/media-replace';
import { swapSortOrderIfNeeded } from '../common/sort-order';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventPhotoDto } from './dto/create-event-photo.dto';
import { ListEventPhotosQueryDto } from './dto/list-event-photos-query.dto';
import { UpdateEventPhotoDto } from './dto/update-event-photo.dto';

export const MAX_EVENT_PHOTOS = 24;

const SELECT = {
  id: true,
  imageUrl: true,
  alt: true,
  objectPosition: true,
  sortOrder: true,
  isPublished: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.EventPhotoSelect;

@Injectable()
export class EventPhotosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  list(query: ListEventPhotosQueryDto) {
    const where: Prisma.EventPhotoWhereInput = {};
    if (query.publishedOnly !== false) {
      where.isPublished = true;
    }

    return this.prisma.eventPhoto.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      select: SELECT,
    });
  }

  async create(dto: CreateEventPhotoDto) {
    const count = await this.prisma.eventPhoto.count();
    if (count >= MAX_EVENT_PHOTOS) {
      throw new BadRequestException(
        `Chỉ được tối đa ${MAX_EVENT_PHOTOS} ảnh sự kiện`,
      );
    }

    return this.prisma.eventPhoto.create({
      data: {
        imageUrl: dto.imageUrl.trim(),
        alt: dto.alt.trim(),
        objectPosition: dto.objectPosition?.trim() || 'center',
        sortOrder: dto.sortOrder ?? count,
        isPublished: dto.isPublished ?? true,
      },
      select: SELECT,
    });
  }

  async update(id: string, dto: UpdateEventPhotoDto) {
    const existing = await this.prisma.eventPhoto.findUnique({
      where: { id },
      select: { id: true, imageUrl: true, sortOrder: true },
    });
    if (!existing) throw new NotFoundException('Không tìm thấy ảnh sự kiện');

    const nextUrl = dto.imageUrl;
    const image = await this.prisma.$transaction(async (tx) => {
      await swapSortOrderIfNeeded(tx.eventPhoto, {
        id,
        currentOrder: existing.sortOrder,
        nextOrder: dto.sortOrder,
      });

      return tx.eventPhoto.update({
        where: { id },
        data: {
          ...(dto.imageUrl !== undefined
            ? { imageUrl: dto.imageUrl.trim() }
            : {}),
          ...(dto.alt !== undefined ? { alt: dto.alt.trim() } : {}),
          ...(dto.objectPosition !== undefined
            ? { objectPosition: dto.objectPosition.trim() || 'center' }
            : {}),
          ...(dto.sortOrder !== undefined ? { sortOrder: dto.sortOrder } : {}),
          ...(dto.isPublished !== undefined
            ? { isPublished: dto.isPublished }
            : {}),
        },
        select: SELECT,
      });
    });

    await deleteReplacedMedia(
      this.cloudinaryService,
      existing.imageUrl,
      nextUrl,
    );

    return image;
  }

  async remove(id: string) {
    const existing = await this.prisma.eventPhoto.findUnique({
      where: { id },
      select: { id: true, imageUrl: true },
    });
    if (!existing) throw new NotFoundException('Không tìm thấy ảnh sự kiện');

    await this.prisma.eventPhoto.delete({ where: { id } });
    await this.cloudinaryService.deleteImageByUrl(existing.imageUrl);

    return { message: 'Đã xóa ảnh sự kiện và Cloudinary (nếu có)' };
  }
}
