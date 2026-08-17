import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AttendanceStatus, InvoiceStatus } from '../../generated/prisma/client';
import { formatDateOnly, utcToday } from '../common/validation/date-only';
import { PrismaService } from '../prisma/prisma.service';

const REMINDER_DAYS = 3;

@Injectable()
export class ParentService {
  constructor(private readonly prisma: PrismaService) {}

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

    const statuses = records.map((record) => record.status);
    const total = statuses.length;
    const attended = statuses.filter(
      (status) =>
        status === AttendanceStatus.PRESENT || status === AttendanceStatus.LATE,
    ).length;

    return {
      data: {
        student,
        records: records.map((record) => ({
          id: record.id,
          status: record.status,
          note: record.note,
          date: formatDateOnly(record.session.date),
          class: record.session.class,
        })),
        rate: {
          total,
          present: statuses.filter((s) => s === AttendanceStatus.PRESENT).length,
          late: statuses.filter((s) => s === AttendanceStatus.LATE).length,
          absent: statuses.filter((s) => s === AttendanceStatus.ABSENT).length,
          percent: total === 0 ? 0 : Math.round((attended / total) * 100),
        },
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

  async reportTransfer(parentUserId: string, invoiceId: string) {
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
    if (invoice.status === InvoiceStatus.PENDING) {
      throw new BadRequestException('Bạn đã báo chuyển khoản, vui lòng chờ xác nhận.');
    }

    const updated = await this.prisma.tuitionInvoice.update({
      where: { id: invoiceId },
      data: { status: InvoiceStatus.PENDING },
      include: { student: { select: { id: true, fullName: true } } },
    });

    return { message: 'Đã ghi nhận báo chuyển khoản.', data: updated };
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
