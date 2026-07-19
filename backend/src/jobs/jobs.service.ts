import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateJobDto } from './dto/create-job.dto';
import { ListJobsQueryDto } from './dto/list-jobs-query.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import {
  SALARY_AMOUNT,
  type SalaryCurrency,
  type SalaryType,
} from './job-salary';

const JOB_SELECT = {
  id: true,
  title: true,
  type: true,
  location: true,
  salaryType: true,
  salaryMin: true,
  salaryMax: true,
  currency: true,
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

  private normalizeTitle(title: string) {
    return title.trim().replace(/\s+/g, ' ').toLocaleLowerCase('vi-VN');
  }

  private validateSalary(
    salaryType: SalaryType,
    salaryMin: number | null,
    salaryMax: number | null,
  ) {
    if (salaryType === 'NEGOTIABLE') {
      if (salaryMin !== null || salaryMax !== null) {
        throw new BadRequestException(
          'Lương thỏa thuận không được có mức tối thiểu hoặc tối đa',
        );
      }
      return;
    }

    if (
      !Number.isInteger(salaryMin) ||
      (salaryMin ?? 0) < SALARY_AMOUNT.min ||
      (salaryMin ?? 0) > SALARY_AMOUNT.max
    ) {
      throw new BadRequestException(
        `Lương tối thiểu phải là số nguyên từ ${SALARY_AMOUNT.min} đến ${SALARY_AMOUNT.max}`,
      );
    }

    if (salaryType === 'FIXED') {
      if (salaryMax !== null) {
        throw new BadRequestException('Lương cố định không được có mức tối đa');
      }
      return;
    }

    if (
      !Number.isInteger(salaryMax) ||
      (salaryMax ?? 0) < SALARY_AMOUNT.min ||
      (salaryMax ?? 0) > SALARY_AMOUNT.max
    ) {
      throw new BadRequestException(
        `Lương tối đa phải là số nguyên từ ${SALARY_AMOUNT.min} đến ${SALARY_AMOUNT.max}`,
      );
    }
    if ((salaryMax as number) < (salaryMin as number)) {
      throw new BadRequestException(
        'Lương tối đa phải lớn hơn hoặc bằng lương tối thiểu',
      );
    }
  }

  private isRecordNotFoundError(error: unknown) {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    );
  }

  private isUniqueConstraintError(error: unknown) {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    );
  }

  private isUniqueConstraintOn(error: unknown, field: string) {
    if (
      !(error instanceof Prisma.PrismaClientKnownRequestError) ||
      error.code !== 'P2002'
    ) {
      return false;
    }

    const target = error.meta?.target;
    const normalizedField = field.toLocaleLowerCase('en-US');
    const targetMatches = Array.isArray(target)
      ? target.some(
          (item) =>
            typeof item === 'string' &&
            item.toLocaleLowerCase('en-US').includes(normalizedField),
        )
      : typeof target === 'string' &&
        target.toLocaleLowerCase('en-US').includes(normalizedField);

    return (
      targetMatches ||
      error.message.toLocaleLowerCase('en-US').includes(normalizedField)
    );
  }

  private async ensureSortOrderAvailable(sortOrder: number, excludeId?: string) {
    const existing = await this.prisma.job.findFirst({
      where: {
        sortOrder,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
      select: { id: true },
    });

    if (existing) {
      throw new ConflictException(
        'Thứ tự hiển thị đã được sử dụng. Vui lòng chọn một số khác.',
      );
    }
  }

  private throwIfJobConflict(error: unknown): never {
    if (
      this.isUniqueConstraintOn(error, 'sortOrder') ||
      this.isUniqueConstraintOn(error, 'sort_order')
    ) {
      throw new ConflictException(
        'Thứ tự hiển thị đã được sử dụng. Vui lòng chọn một số khác.',
      );
    }

    if (this.isUniqueConstraintError(error)) {
      throw new ConflictException('Tên vị trí tuyển dụng đã tồn tại');
    }

    throw error;
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
  async listForAdmin(query: ListJobsQueryDto) {
    const { page, pageSize } = query;
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

    return this.prisma.$transaction(async (transaction) => {
      const totalItems = await transaction.job.count({ where });
      const totalPages = Math.ceil(totalItems / pageSize);

      if (page > Math.max(totalPages, 1)) {
        throw new BadRequestException(
          `Trang ${page} vượt quá tổng số ${totalPages} trang.`,
        );
      }

      const jobs = await transaction.job.findMany({
        where,
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: JOB_SELECT,
      });
      const maximumSortOrder = await transaction.job.aggregate({
        _max: { sortOrder: true },
      });

      return {
        data: jobs,
        meta: {
          currentPage: page,
          pageSize,
          totalItems,
          totalPages,
          hasPreviousPage: page > 1,
          hasNextPage: page < totalPages,
          nextSortOrder: Math.min(
            10000,
            (maximumSortOrder._max.sortOrder ?? 0) + 1,
          ),
        },
      };
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

  async create(dto: CreateJobDto) {
    const title = dto.title.trim().replace(/\s+/g, ' ');
    const salaryMin = dto.salaryMin ?? null;
    const salaryMax = dto.salaryMax ?? null;
    this.validateSalary(dto.salaryType, salaryMin, salaryMax);
    const maximumSortOrder =
      dto.sortOrder === undefined
        ? await this.prisma.job.aggregate({ _max: { sortOrder: true } })
        : null;
    const sortOrder =
      dto.sortOrder ??
      Math.min(10000, (maximumSortOrder?._max.sortOrder ?? 0) + 1);
    await this.ensureSortOrderAvailable(sortOrder);
    try {
      return await this.prisma.job.create({
        data: {
          title,
          normalizedTitle: this.normalizeTitle(title),
          type: dto.type.trim(),
          location: dto.location.trim(),
          salaryType: dto.salaryType,
          salaryMin,
          salaryMax,
          currency: dto.currency,
          duties: this.normalizeItems(dto.duties, 'duties'),
          benefits: this.normalizeItems(dto.benefits, 'benefits'),
          req: dto.req.trim(),
          sortOrder,
          isPublished: dto.isPublished ?? true,
        },
        select: JOB_SELECT,
      });
    } catch (error: unknown) {
      this.throwIfJobConflict(error);
    }
  }

  async update(id: string, dto: UpdateJobDto) {
    if (Object.keys(dto).length === 0) {
      throw new BadRequestException(
        'Cần cung cấp ít nhất một trường để cập nhật',
      );
    }

    if (dto.sortOrder !== undefined) {
      await this.ensureSortOrderAvailable(dto.sortOrder, id);
    }

    const title = dto.title?.trim().replace(/\s+/g, ' ');
    const hasSalaryUpdate =
      dto.salaryType !== undefined ||
      dto.salaryMin !== undefined ||
      dto.salaryMax !== undefined ||
      dto.currency !== undefined;
    let salaryData:
      | {
          salaryType: SalaryType;
          salaryMin: number | null;
          salaryMax: number | null;
          currency: SalaryCurrency;
        }
      | undefined;

    if (hasSalaryUpdate) {
      const currentJob = await this.prisma.job.findUnique({
        where: { id },
        select: {
          salaryType: true,
          salaryMin: true,
          salaryMax: true,
          currency: true,
        },
      });
      if (!currentJob) {
        throw new NotFoundException(
          'Không tìm thấy vị trí tuyển dụng để cập nhật',
        );
      }

      const salaryType = dto.salaryType ?? currentJob.salaryType;
      const salaryMin =
        dto.salaryMin !== undefined ? dto.salaryMin : currentJob.salaryMin;
      const salaryMax =
        dto.salaryMax !== undefined ? dto.salaryMax : currentJob.salaryMax;
      const currency = (dto.currency ?? currentJob.currency) as SalaryCurrency;
      this.validateSalary(salaryType, salaryMin, salaryMax);
      salaryData = {
        salaryType,
        salaryMin,
        salaryMax,
        currency,
      };
    }

    try {
      return await this.prisma.job.update({
        where: { id },
        data: {
          ...(title !== undefined
            ? { title, normalizedTitle: this.normalizeTitle(title) }
            : {}),
          ...(dto.type !== undefined ? { type: dto.type.trim() } : {}),
          ...(dto.location !== undefined
            ? { location: dto.location.trim() }
            : {}),
          ...(salaryData ?? {}),
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

      this.throwIfJobConflict(error);
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.job.delete({ where: { id } });
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
