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
import { CreateGalleryImageDto } from './dto/create-gallery-image.dto';
import { ListGalleryImagesQueryDto } from './dto/list-gallery-images-query.dto';
import { UpdateGalleryImageDto } from './dto/update-gallery-image.dto';

export const MAX_GALLERY_IMAGES = 6;

const SELECT = {
  id: true,
  imageUrl: true,
  alt: true,
  objectPosition: true,
  sortOrder: true,
  isPublished: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.GalleryImageSelect;

@Injectable()
export class GalleryImagesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  list(query: ListGalleryImagesQueryDto) {
    const where: Prisma.GalleryImageWhereInput = {};
    if (query.publishedOnly !== false) {
      where.isPublished = true;
    }

    return this.prisma.galleryImage.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      select: SELECT,
    });
  }

  async create(dto: CreateGalleryImageDto) {
    const count = await this.prisma.galleryImage.count();
    if (count >= MAX_GALLERY_IMAGES) {
      throw new BadRequestException(
        `Chỉ được tối đa ${MAX_GALLERY_IMAGES} ảnh môi trường học tập`,
      );
    }

    return this.prisma.galleryImage.create({
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

  async update(id: string, dto: UpdateGalleryImageDto) {
    const existing = await this.prisma.galleryImage.findUnique({
      where: { id },
      select: { id: true, imageUrl: true, sortOrder: true },
    });
    if (!existing) throw new NotFoundException('Không tìm thấy ảnh gallery');

    const nextUrl = dto.imageUrl;
    const image = await this.prisma.$transaction(async (tx) => {
      await swapSortOrderIfNeeded(tx.galleryImage, {
        id,
        currentOrder: existing.sortOrder,
        nextOrder: dto.sortOrder,
      });

      return tx.galleryImage.update({
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
    const existing = await this.prisma.galleryImage.findUnique({
      where: { id },
      select: { id: true, imageUrl: true },
    });
    if (!existing) throw new NotFoundException('Không tìm thấy ảnh gallery');

    await this.prisma.galleryImage.delete({ where: { id } });
    await this.cloudinaryService.deleteImageByUrl(existing.imageUrl);

    return { message: 'Đã xóa ảnh gallery và Cloudinary (nếu có)' };
  }
}
