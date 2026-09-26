import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { deleteReplacedMedia } from '../common/media-replace';
import { swapSortOrderIfNeeded } from '../common/sort-order';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSuccessStoryDto } from './dto/create-success-story.dto';
import { ListSuccessStoriesQueryDto } from './dto/list-success-stories-query.dto';
import { UpdateSuccessStoryDto } from './dto/update-success-story.dto';

const SELECT = {
  id: true,
  name: true,
  course: true,
  badge: true,
  text: true,
  stars: true,
  avatar: true,
  imageUrl: true,
  sortOrder: true,
  isPublished: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.SuccessStorySelect;

@Injectable()
export class SuccessStoriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  list(query: ListSuccessStoriesQueryDto) {
    const where: Prisma.SuccessStoryWhereInput = {};
    if (query.publishedOnly !== false) {
      where.isPublished = true;
    }

    return this.prisma.successStory.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      select: SELECT,
    });
  }

  async create(dto: CreateSuccessStoryDto) {
    return this.prisma.successStory.create({
      data: {
        name: dto.name.trim(),
        course: dto.course.trim(),
        badge: dto.badge.trim(),
        text: dto.text.trim(),
        stars: dto.stars ?? 5,
        avatar: dto.avatar.trim().toUpperCase(),
        imageUrl: dto.imageUrl?.trim() || null,
        sortOrder: dto.sortOrder ?? 0,
        isPublished: dto.isPublished ?? true,
      },
      select: SELECT,
    });
  }

  async update(id: string, dto: UpdateSuccessStoryDto) {
    const existing = await this.prisma.successStory.findUnique({
      where: { id },
      select: { id: true, sortOrder: true, imageUrl: true },
    });
    if (!existing) throw new NotFoundException('Không tìm thấy câu chuyện');

    const nextUrl = dto.imageUrl;
    const story = await this.prisma.$transaction(async (tx) => {
      await swapSortOrderIfNeeded(tx.successStory, {
        id,
        currentOrder: existing.sortOrder,
        nextOrder: dto.sortOrder,
      });

      return tx.successStory.update({
        where: { id },
        data: {
          ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
          ...(dto.course !== undefined ? { course: dto.course.trim() } : {}),
          ...(dto.badge !== undefined ? { badge: dto.badge.trim() } : {}),
          ...(dto.text !== undefined ? { text: dto.text.trim() } : {}),
          ...(dto.stars !== undefined ? { stars: dto.stars } : {}),
          ...(dto.avatar !== undefined
            ? { avatar: dto.avatar.trim().toUpperCase() }
            : {}),
          ...(dto.imageUrl !== undefined
            ? { imageUrl: dto.imageUrl?.trim() || null }
            : {}),
          ...(dto.sortOrder !== undefined ? { sortOrder: dto.sortOrder } : {}),
          ...(dto.isPublished !== undefined
            ? { isPublished: dto.isPublished }
            : {}),
        },
        select: SELECT,
      });
    });

    if (dto.imageUrl !== undefined) {
      await deleteReplacedMedia(
        this.cloudinaryService,
        existing.imageUrl ?? undefined,
        typeof nextUrl === 'string' ? nextUrl : undefined,
      );
    }

    return story;
  }

  async remove(id: string) {
    const existing = await this.prisma.successStory.findUnique({
      where: { id },
      select: { id: true, imageUrl: true },
    });
    if (!existing) throw new NotFoundException('Không tìm thấy câu chuyện');

    await this.prisma.successStory.delete({ where: { id } });
    if (existing.imageUrl) {
      await this.cloudinaryService.deleteImageByUrl(existing.imageUrl);
    }
    return { message: 'Đã xóa câu chuyện thành công' };
  }
}
