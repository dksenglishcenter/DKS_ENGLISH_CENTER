import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AttendanceStatus, InvoiceStatus } from '../../generated/prisma/client';
import { CLOUDINARY_FOLDERS } from '../cloudinary/cloudinary.constants';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import {
  formatDateOnly,
  optionalDateOnly,
  utcToday,
} from '../common/validation/date-only';
import { PrismaService } from '../prisma/prisma.service';
import {
  buildParentClassTimeline,
  rateFromStatuses,
  resolveClassWindow,
} from './parent-attendance';

const REMINDER_DAYS = 3;

type ReportTransferInput = {
  file?: Express.Multer.File;
  paymentProofUrl?: string;
};

@Injectable()
export class ParentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  bankDetails() {
    return {
      bankName: process.env.BANK_NAME?.trim() || 'Vietcombank',
      accountName: process.env.BANK_ACCOUNT_NAME?.trim() || 'DKS English Center',
      accountNumber: process.env.BANK_ACCOUNT_NUMBER?.trim() || '0123456789',
      note: 'Nội dung CK: HP [tên học viên] [tháng]',
    };
  }

  async listChildren(parentUserId: string) {
    const links = await this.prisma.studentParent.findMany({
      where: { parentUserId },
      include: {
        student: {
          select: {
            id: true,
            fullName: true,
            status: true,
            phone: true,
            enrollments: {
              where: { leftAt: null },
              select: {
                id: true,
                classId: true,
                class: { select: { id: true, name: true, status: true } },
              },
              orderBy: { joinedAt: 'asc' },
            },
          },
        },
      },
      orderBy: { student: { fullName: 'asc' } },
    });

    return { data: links.map((link) => link.student) };
  }

  async childAttendance(parentUserId: string, studentId: string) {
    await this.assertLinkedChild(parentUserId, studentId);

    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      select: { id: true, fullName: true, status: true },
    });

    const enrollments = await this.prisma.enrollment.findMany({
      where: { studentId, leftAt: null },
      include: {
        class: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                startDate: true,
                endDate: true,
              },
            },
            sessions: {
              orderBy: { date: 'desc' },
              include: {
                attendances: {
                  where: { studentId },
                  select: { id: true, status: true, note: true },
                },
              },
            },
          },
        },
      },
      orderBy: { joinedAt: 'asc' },
    });

    const today = formatDateOnly(utcToday());
    const classes = enrollments.map((enrollment) => {
      const classGroup = enrollment.class;
      const window = resolveClassWindow({
        startsOn: classGroup.startsOn,
        endsOn: classGroup.endsOn,
        courseStart: classGroup.course?.startDate,
        courseEnd: classGroup.course?.endDate,
      });
      const sessions = buildParentClassTimeline({
        scheduleDays: classGroup.scheduleDays,
        startsOn: window.startsOn,
        endsOn: window.endsOn,
        sessions: classGroup.sessions,
        today,
      });
      const marked = sessions
        .map((session) => session.status)
        .filter((status): status is AttendanceStatus => status != null);

      return {
        id: classGroup.id,
        name: classGroup.name,
        scheduleDays: classGroup.scheduleDays,
        startTime: classGroup.startTime,
        endTime: classGroup.endTime,
        startsOn: window.startsOn,
        endsOn: window.endsOn,
        course: classGroup.course
          ? {
              id: classGroup.course.id,
              title: classGroup.course.title,
              startDate: optionalDateOnly(classGroup.course.startDate),
              endDate: optionalDateOnly(classGroup.course.endDate),
            }
          : null,
        sessions,
        rate: rateFromStatuses(marked),
      };
    });

    const records = await this.prisma.attendanceRecord.findMany({
      where: { studentId },
      include: {
        session: {
          select: {
            id: true,
            date: true,
            class: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { session: { date: 'desc' } },
    });

    return {
      data: {
        student,
        classes,
        records: records.map((record) => ({
          id: record.id,
          status: record.status,
          note: record.note,
          date: formatDateOnly(record.session.date),
          class: record.session.class,
        })),
        rate: rateFromStatuses(records.map((record) => record.status)),
      },
    };
  }

  async listInvoices(parentUserId: string) {
    const children = await this.linkedStudentIds(parentUserId);
    const invoices = await this.prisma.tuitionInvoice.findMany({
      where: { studentId: { in: children } },
      include: {
        student: { select: { id: true, fullName: true } },
      },
      orderBy: [{ dueDate: 'desc' }, { createdAt: 'desc' }],
    });

    return {
      data: invoices,
      bank: this.bankDetails(),
    };
  }

  async reminders(parentUserId: string) {
    const children = await this.linkedStudentIds(parentUserId);
    const today = utcToday();
    const soon = new Date(today);
    soon.setUTCDate(soon.getUTCDate() + REMINDER_DAYS);

    const invoices = await this.prisma.tuitionInvoice.findMany({
      where: {
        studentId: { in: children },
        status: { in: [InvoiceStatus.UNPAID, InvoiceStatus.PENDING] },
        dueDate: { lte: soon },
      },
      include: {
        student: { select: { id: true, fullName: true } },
      },
      orderBy: { dueDate: 'asc' },
    });

    return {
      data: invoices.map((invoice) => ({
        ...invoice,
        overdue: invoice.dueDate < today,
      })),
    };
  }

  async reportTransfer(
    parentUserId: string,
    invoiceId: string,
    input: ReportTransferInput,
  ) {
    const proofUrl = await this.resolveProofUrl(input);

    const invoice = await this.prisma.tuitionInvoice.findUnique({
      where: { id: invoiceId },
      include: { student: { select: { id: true, fullName: true } } },
    });
    if (!invoice) {
      throw new NotFoundException('Không tìm thấy khoản học phí.');
    }

    await this.assertLinkedChild(parentUserId, invoice.studentId);

    if (invoice.status === InvoiceStatus.PAID) {
      throw new BadRequestException('Khoản học phí này đã được xác nhận.');
    }

    // Cho phép bổ sung minh chứng nếu báo CK trước đó chưa kèm ảnh.
    if (invoice.status === InvoiceStatus.PENDING) {
      if (invoice.paymentProofUrl) {
        throw new BadRequestException(
          'Bạn đã báo chuyển khoản, vui lòng chờ xác nhận.',
        );
      }

      const updated = await this.prisma.tuitionInvoice.update({
        where: { id: invoiceId },
        data: { paymentProofUrl: proofUrl },
        include: { student: { select: { id: true, fullName: true } } },
      });

      return {
        message: 'Đã bổ sung minh chứng chuyển khoản.',
        data: updated,
      };
    }

    const updated = await this.prisma.tuitionInvoice.update({
      where: { id: invoiceId },
      data: {
        status: InvoiceStatus.PENDING,
        paymentProofUrl: proofUrl,
      },
      include: { student: { select: { id: true, fullName: true } } },
    });

    return { message: 'Đã ghi nhận báo chuyển khoản.', data: updated };
  }

  private async resolveProofUrl(input: ReportTransferInput) {
    if (input.file) {
      if (!input.file.mimetype?.startsWith('image/')) {
        throw new BadRequestException(
          'Minh chứng phải là file ảnh (PNG, JPG, WebP...).',
        );
      }
      const uploaded = await this.cloudinaryService.uploadImage(input.file, {
        category: 'tuition-proof',
      });
      return uploaded.secure_url;
    }

    const proofUrl = input.paymentProofUrl?.trim();
    if (!proofUrl) {
      throw new BadRequestException(
        'Vui lòng chọn ảnh minh chứng chuyển khoản.',
      );
    }
    if (!proofUrl.includes(CLOUDINARY_FOLDERS.tuitionProofs)) {
      throw new BadRequestException(
        'Minh chứng phải được upload qua hệ thống (Cloudinary).',
      );
    }
    return proofUrl;
  }

  private async linkedStudentIds(parentUserId: string) {
    const links = await this.prisma.studentParent.findMany({
      where: { parentUserId },
      select: { studentId: true },
    });
    return links.map((link) => link.studentId);
  }

  private async assertLinkedChild(parentUserId: string, studentId: string) {
    const link = await this.prisma.studentParent.findUnique({
      where: {
        parentUserId_studentId: { parentUserId, studentId },
      },
      select: { id: true },
    });
    if (!link) {
      throw new ForbiddenException('Bạn không có quyền xem học viên này.');
    }
  }
}
