import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';

import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CLOUDINARY_FOLDERS } from '../cloudinary/cloudinary.constants';
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
  cvUrl: true,
  cvFileName: true,
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
    private readonly cloudinaryService: CloudinaryService,
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
      const existing = await this.prisma.careerApplication.findUnique({
        where: { id },
        select: { id: true, cvUrl: true },
      });
      if (!existing) {
        throw new NotFoundException('Không tìm thấy đơn ứng tuyển cần xóa.');
      }

      await this.prisma.careerApplication.delete({ where: { id } });
      if (existing.cvUrl) {
        await this.cloudinaryService.deleteRawByUrl(existing.cvUrl);
      }

      return {
        success: true,
        data: null,
        message: 'Đã xóa đơn ứng tuyển.',
      };
    } catch (error: unknown) {
      if (error instanceof NotFoundException) throw error;
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Không tìm thấy đơn ứng tuyển cần xóa.');
      }

      throw error;
    }
  }

  async downloadCv(id: string) {
    const application = await this.prisma.careerApplication.findUnique({
      where: { id },
      select: { id: true, cvUrl: true, cvFileName: true },
    });
    if (!application?.cvUrl) {
      throw new NotFoundException('Không tìm thấy CV của đơn ứng tuyển này.');
    }

    const buffer = await this.cloudinaryService.fetchRawBytes(application.cvUrl);
    const fileName =
      application.cvFileName?.trim() ||
      decodeURIComponent(
        application.cvUrl.split('?')[0]?.split('/').pop() || 'CV.pdf',
      );
    const lower = fileName.toLowerCase();
    const contentType = lower.endsWith('.docx')
      ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      : lower.endsWith('.doc')
        ? 'application/msword'
        : 'application/pdf';

    return { buffer, fileName, contentType };
  }

  async uploadCv(file: Express.Multer.File) {
    const result = await this.cloudinaryService.uploadCareerCv(file);
    const fileName = (file.originalname || 'CV').trim().slice(0, 200);
    return {
      url: result.secure_url,
      publicId: result.public_id,
      fileName,
    };
  }

  async create(dto: CreateCareerApplicationDto) {
    const cvUrl = dto.cvUrl.trim();
    if (!cvUrl.includes(CLOUDINARY_FOLDERS.careerCvs)) {
      throw new BadRequestException(
        'CV phải được upload qua hệ thống (PDF/Word).',
      );
    }

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
        cvUrl,
        cvFileName: dto.cvFileName.trim().slice(0, 200),
      },
      select: {
        id: true,
        createdAt: true,
      },
    });

    return {
      id: application.id,
      createdAt: application.createdAt,
    };
  }
}
