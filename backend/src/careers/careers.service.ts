import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';

import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCareerApplicationDto } from './dto/create-career-application.dto';
import { ListCareerApplicationsQueryDto } from './dto/list-career-applications-query.dto';

const CAREER_APPLICATION_SELECT = {
  id: true,
  jobId: true,
  fullName: true,
  email: true,
  phone: true,
  position: true,
  introduction: true,
  createdAt: true,
  job: {
    select: {
      id: true,
      title: true,
      isPublished: true,
    },
  },
} satisfies Prisma.CareerApplicationSelect;

@Injectable()
export class CareersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

  async listApplications(query: ListCareerApplicationsQueryDto) {
    const { page, pageSize, jobId } = query;
    const search = query.search?.trim();
    const where: Prisma.CareerApplicationWhereInput = {
      ...(jobId ? { jobId } : {}),
      ...(search
        ? {
            OR: [
              { fullName: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
              { phone: { contains: search } },
              { position: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    return this.prisma.$transaction(async (transaction) => {
      const totalItems = await transaction.careerApplication.count({ where });
      const totalPages = Math.ceil(totalItems / pageSize);

      if (page > Math.max(totalPages, 1)) {
        throw new BadRequestException(
          `Trang ${page} vượt quá tổng số ${totalPages} trang.`,
        );
      }

      const applications = await transaction.careerApplication.findMany({
        where,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: CAREER_APPLICATION_SELECT,
      });

      return {
        success: true,
        data: applications,
        meta: {
          totalItems,
          totalPages,
          currentPage: page,
          pageSize,
        },
      };
    });
  }

  async removeApplication(id: string) {
    try {
      await this.prisma.careerApplication.delete({ where: { id } });
      return {
        success: true,
        data: null,
        message: 'Đã xóa đơn ứng tuyển.',
      };
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Không tìm thấy đơn ứng tuyển cần xóa.');
      }

      throw error;
    }
  }

  async create(dto: CreateCareerApplicationDto) {
    const publishedJob = await this.prisma.job.findFirst({
      where: { id: dto.jobId, isPublished: true },
      select: { id: true, title: true },
    });

    if (!publishedJob) {
      throw new BadRequestException(
        'Vị trí ứng tuyển không tồn tại hoặc đã ngừng tuyển',
      );
    }

    const application = await this.prisma.careerApplication.create({
      data: {
        jobId: publishedJob.id,
        fullName: dto.fullName.trim(),
        email: dto.email.trim(),
        phone: dto.phone.trim(),
        position: publishedJob.title,
        introduction: dto.introduction?.trim() || null,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        position: true,
        introduction: true,
        createdAt: true,
      },
    });

    void this.mailService.notifyCareerApplication({
      id: application.id,
      fullName: application.fullName,
      email: application.email,
      phone: application.phone,
      position: application.position,
      introduction: application.introduction,
      createdAt: application.createdAt,
    });

    return {
      id: application.id,
      createdAt: application.createdAt,
    };
  }
}
