import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';
import { deleteReplacedMedia } from '../common/media-replace';
import { swapSortOrderIfNeeded } from '../common/sort-order';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { ListTeachersQueryDto } from './dto/list-teachers-query.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';

const SELECT = {
  id: true,
  name: true,
  title: true,
  cred: true,
  exp: true,
  imageUrl: true,
  bio: true,
  sortOrder: true,
  isPublished: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.TeacherSelect;

@Injectable()
export class TeachersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  list(query: ListTeachersQueryDto) {
    const where: Prisma.TeacherWhereInput = {};
    if (query.publishedOnly !== false) {
      where.isPublished = true;
    }

    return this.prisma.teacher.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      select: SELECT,
    });
  }

  async create(dto: CreateTeacherDto) {
    return this.prisma.teacher.create({
      data: {
        name: dto.name.trim(),
        title: dto.title.trim(),
        cred: dto.cred.trim(),
        exp: dto.exp.trim(),
        imageUrl: dto.imageUrl.trim(),
        bio: dto.bio.trim(),
        sortOrder: dto.sortOrder ?? 0,
        isPublished: dto.isPublished ?? true,
      },
      select: SELECT,
    });
  }

  async update(id: string, dto: UpdateTeacherDto) {
    const existing = await this.prisma.teacher.findUnique({
      where: { id },
      select: { id: true, imageUrl: true, sortOrder: true },
    });
    if (!existing) throw new NotFoundException('Không tìm thấy giáo viên');

    const nextUrl = dto.imageUrl;

    const teacher = await this.prisma.$transaction(async (tx) => {
      await swapSortOrderIfNeeded(tx.teacher, {
        id,
        currentOrder: existing.sortOrder,
        nextOrder: dto.sortOrder,
      });

      return tx.teacher.update({
        where: { id },
        data: {
          ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
          ...(dto.title !== undefined ? { title: dto.title.trim() } : {}),
          ...(dto.cred !== undefined ? { cred: dto.cred.trim() } : {}),
          ...(dto.exp !== undefined ? { exp: dto.exp.trim() } : {}),
          ...(dto.imageUrl !== undefined
            ? { imageUrl: dto.imageUrl.trim() }
            : {}),
          ...(dto.bio !== undefined ? { bio: dto.bio.trim() } : {}),
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

    return teacher;
  }

  async remove(id: string) {
    const existing = await this.prisma.teacher.findUnique({
      where: { id },
      select: { id: true, imageUrl: true },
    });
    if (!existing) throw new NotFoundException('Không tìm thấy giáo viên');

    await this.prisma.teacher.delete({ where: { id } });
    await this.cloudinaryService.deleteImageByUrl(existing.imageUrl);

    return { message: 'Đã xóa giáo viên và Cloudinary (nếu có)' };
  }
}
