import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateJobDto } from './dto/create-job.dto';
import { ListJobsQueryDto } from './dto/list-jobs-query.dto';
import { UpdateJobDto } from './dto/update-job.dto';

const JOB_SELECT = {
  id: true,
  title: true,
  type: true,
  location: true,
  salary: true,
  duties: true,
  benefits: true,
  req: true,
  sortOrder: true,
  isPublished: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.JobSelect;

@Injectable()
export class JobsService {
  constructor(private readonly prisma: PrismaService) {}

  private normalizeItems(items: string[], fieldName: string) {
    const normalizedItems = items.map((item) => item.trim());

    if (new Set(normalizedItems).size !== normalizedItems.length) {
      throw new BadRequestException(
        `${fieldName} không được chứa nội dung trùng nhau`,
      );
    }

    return normalizedItems;
  }

  private isRecordNotFoundError(error: unknown) {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    );
  }

  //Lấy các vị trí tuyển dụng đã được published trong cơ sở dữ liệu
  listPublished() {
    return this.prisma.job.findMany({
      where: { isPublished: true },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      select: JOB_SELECT,
    });
  }

  //lấy tất cả các vị trí tuyển dụng (cả published và unpublished) trong cơ sở dữ liệu, có thể lọc theo isPublished và search
  listForAdmin(query: ListJobsQueryDto) {
    const search = query.search?.trim();
    const where: Prisma.JobWhereInput = {
      ...(query.isPublished !== undefined
        ? { isPublished: query.isPublished }
        : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: 'insensitive' as const } },
              { type: { contains: search, mode: 'insensitive' as const } },
              { location: { contains: search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };

    return this.prisma.job.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      select: JOB_SELECT,
    });
  }

  //lấy vị trí tuyển dụng đã được published theo id trong cơ sở dữ liệu
  async findPublishedById(id: string) {
    const job = await this.prisma.job.findFirst({
      where: { id, isPublished: true },
      select: JOB_SELECT,
    });

    if (!job)
      throw new NotFoundException(
        'Không tìm thấy vị trí tuyển dụng cần hiển thị',
      );
    return job;
  }

  create(dto: CreateJobDto) {
    return this.prisma.job.create({
      data: {
        title: dto.title.trim(),
        type: dto.type.trim(),
        location: dto.location.trim(),
        salary: dto.salary.trim(),
        duties: this.normalizeItems(dto.duties, 'duties'),
        benefits: this.normalizeItems(dto.benefits, 'benefits'),
        req: dto.req.trim(),
        sortOrder: dto.sortOrder ?? 0,
        isPublished: dto.isPublished ?? true,
      },
      select: JOB_SELECT,
    });
  }

  async update(id: string, dto: UpdateJobDto) {
    if (Object.keys(dto).length === 0) {
      throw new BadRequestException(
        'Cần cung cấp ít nhất một trường để cập nhật',
      );
    }

    try {
      return await this.prisma.job.update({
        where: { id },
        data: {
          ...(dto.title !== undefined ? { title: dto.title.trim() } : {}),
          ...(dto.type !== undefined ? { type: dto.type.trim() } : {}),
          ...(dto.location !== undefined
            ? { location: dto.location.trim() }
            : {}),
          ...(dto.salary !== undefined ? { salary: dto.salary.trim() } : {}),
          ...(dto.duties !== undefined
            ? { duties: this.normalizeItems(dto.duties, 'duties') }
            : {}),
          ...(dto.benefits !== undefined
            ? { benefits: this.normalizeItems(dto.benefits, 'benefits') }
            : {}),
          ...(dto.req !== undefined ? { req: dto.req.trim() } : {}),
          ...(dto.sortOrder !== undefined ? { sortOrder: dto.sortOrder } : {}),
          ...(dto.isPublished !== undefined
            ? { isPublished: dto.isPublished }
            : {}),
        },
        select: JOB_SELECT,
      });
    } catch (error: unknown) {
      if (this.isRecordNotFoundError(error)) {
        throw new NotFoundException(
          'Không tìm thấy vị trí tuyển dụng để cập nhật',
        );
      }

      throw error;
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.job.delete({ where: { id } });
      return { message: 'Đã xóa vị trí tuyển dụng' };
    } catch (error: unknown) {
      if (this.isRecordNotFoundError(error)) {
        throw new NotFoundException(
          'Không tìm thấy vị trí tuyển dụng cần xóa ',
        );
      }

      throw error;
    }
  }
}
