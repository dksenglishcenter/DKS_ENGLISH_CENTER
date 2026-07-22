import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';

// TODO(email): bật lại cùng notifyContactSubmission bên dưới
// import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { ListContactSubmissionsQueryDto } from './dto/list-contact-submissions-query.dto';

const CONTACT_SUBMISSION_SELECT = {
  id: true,
  fullName: true,
  phone: true,
  email: true,
  courseInterest: true,
  learningNeeds: true,
  createdAt: true,
} satisfies Prisma.ContactSubmissionSelect;

@Injectable()
export class ContactService {
  constructor(
    private readonly prisma: PrismaService,
    // private readonly mailService: MailService,
  ) {}

  async listSubmissions(query: ListContactSubmissionsQueryDto) {
    const { page, pageSize } = query;
    const search = query.search?.trim();
    const where: Prisma.ContactSubmissionWhereInput = search
      ? {
          OR: [
            { fullName: { contains: search, mode: 'insensitive' } },
            { phone: { contains: search } },
            { email: { contains: search, mode: 'insensitive' } },
            { courseInterest: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    return this.prisma.$transaction(async (transaction) => {
      const totalItems = await transaction.contactSubmission.count({ where });
      const totalPages = Math.ceil(totalItems / pageSize);

      if (page > Math.max(totalPages, 1)) {
        throw new BadRequestException(
          `Trang ${page} vượt quá tổng số ${totalPages} trang.`,
        );
      }

      const submissions = await transaction.contactSubmission.findMany({
        where,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: CONTACT_SUBMISSION_SELECT,
      });

      return {
        success: true,
        data: submissions,
        meta: {
          totalItems,
          totalPages,
          currentPage: page,
          pageSize,
        },
      };
    });
  }

  async removeSubmission(id: string) {
    try {
      await this.prisma.contactSubmission.delete({ where: { id } });
      return {
        success: true,
        data: null,
        message: 'Đã xóa yêu cầu tư vấn.',
      };
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Không tìm thấy yêu cầu tư vấn cần xóa.');
      }

      throw error;
    }
  }

  async create(dto: CreateContactDto) {
    const course = await this.prisma.course.findFirst({
      where: {
        title: dto.courseInterest,
        isPublished: true,
      },
      select: { title: true },
    });

    if (!course) {
      throw new BadRequestException('Khóa học đã chọn không còn mở đăng ký.');
    }

    const submission = await this.prisma.contactSubmission.create({
      data: {
        fullName: dto.fullName.trim(),
        phone: dto.phone.trim(),
        email: dto.email?.trim() || null,
        courseInterest: course.title,
        learningNeeds: dto.learningNeeds?.trim() || null,
      },
      select: CONTACT_SUBMISSION_SELECT,
    });

    // TODO(email): bật lại khi EMAIL_FEATURES_ENABLED=true trong mail.service
    // void this.mailService.notifyContactSubmission({
    //   id: submission.id,
    //   fullName: submission.fullName,
    //   phone: submission.phone,
    //   email: submission.email,
    //   courseInterest: submission.courseInterest,
    //   learningNeeds: submission.learningNeeds,
    //   createdAt: submission.createdAt,
    // });

    return {
      id: submission.id,
      createdAt: submission.createdAt,
    };
  }
}
