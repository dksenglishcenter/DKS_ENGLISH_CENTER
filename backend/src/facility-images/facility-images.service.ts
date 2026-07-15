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
import { CreateFacilityImageDto } from './dto/create-facility-image.dto';
import { ListFacilityImagesQueryDto } from './dto/list-facility-images-query.dto';
import { UpdateFacilityImageDto } from './dto/update-facility-image.dto';

export const MAX_FACILITY_IMAGES = 6;

const SELECT = {
  id: true,
  imageUrl: true,
  title: true,
  sortOrder: true,
  isPublished: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.FacilityImageSelect;

@Injectable()
export class FacilityImagesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  list(query: ListFacilityImagesQueryDto) {
    const where: Prisma.FacilityImageWhereInput = {};
    if (query.publishedOnly !== false) {
      where.isPublished = true;
    }

    return this.prisma.facilityImage.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      select: SELECT,
    });
  }

  async create(dto: CreateFacilityImageDto) {
    const count = await this.prisma.facilityImage.count();
    if (count >= MAX_FACILITY_IMAGES) {
      throw new BadRequestException(
        `Chỉ được tối đa ${MAX_FACILITY_IMAGES} ảnh cơ sở vật chất`,
      );
    }

    return this.prisma.facilityImage.create({
      data: {
        imageUrl: dto.imageUrl.trim(),
        title: dto.title.trim(),
        sortOrder: dto.sortOrder ?? count,
        isPublished: dto.isPublished ?? true,
      },
      select: SELECT,
    });
  }

  async update(id: string, dto: UpdateFacilityImageDto) {
    const existing = await this.prisma.facilityImage.findUnique({
      where: { id },
      select: { id: true, imageUrl: true, sortOrder: true },
    });
    if (!existing) throw new NotFoundException('Không tìm thấy ảnh cơ sở vật chất');

    const nextUrl = dto.imageUrl;

    const image = await this.prisma.$transaction(async (tx) => {
      await swapSortOrderIfNeeded(tx.facilityImage, {
        id,
        currentOrder: existing.sortOrder,
        nextOrder: dto.sortOrder,
      });

      return tx.facilityImage.update({
        where: { id },
        data: {
          ...(dto.imageUrl !== undefined
            ? { imageUrl: dto.imageUrl.trim() }
            : {}),
          ...(dto.title !== undefined ? { title: dto.title.trim() } : {}),
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
    const existing = await this.prisma.facilityImage.findUnique({
      where: { id },
      select: { id: true, imageUrl: true },
    });
    if (!existing) throw new NotFoundException('Không tìm thấy ảnh cơ sở vật chất');

    await this.prisma.facilityImage.delete({ where: { id } });
    await this.cloudinaryService.deleteImageByUrl(existing.imageUrl);

    return { message: 'Đã xóa ảnh cơ sở vật chất và Cloudinary (nếu có)' };
  }
}
