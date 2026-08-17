import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InvoiceStatus, Prisma } from '../../generated/prisma/client';
import { parseDateOnly } from '../common/validation/date-only';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateInvoiceDto,
  ListInvoicesQueryDto,
  UpdateInvoiceDto,
} from './dto/tuition.dto';

const INVOICE_INCLUDE = {
  student: {
    select: { id: true, fullName: true, phone: true, email: true },
  },
} satisfies Prisma.TuitionInvoiceInclude;

@Injectable()
export class TuitionService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: ListInvoicesQueryDto) {
    const where: Prisma.TuitionInvoiceWhereInput = {
      ...(query.status ? { status: query.status } : {}),
      ...(query.studentId ? { studentId: query.studentId } : {}),
    };

    const [totalItems, data] = await this.prisma.$transaction([
      this.prisma.tuitionInvoice.count({ where }),
      this.prisma.tuitionInvoice.findMany({
        where,
        orderBy: [{ dueDate: 'desc' }, { createdAt: 'desc' }],
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
        include: INVOICE_INCLUDE,
      }),
    ]);

    return {
      data,
      meta: {
        totalItems,
        totalPages: Math.ceil(totalItems / query.pageSize) || 1,
        currentPage: query.page,
        pageSize: query.pageSize,
      },
    };
  }

  async create(dto: CreateInvoiceDto) {
    const student = await this.prisma.student.findUnique({
      where: { id: dto.studentId },
      select: { id: true },
    });
    if (!student) {
      throw new NotFoundException('Không tìm thấy học viên.');
    }

    try {
      const invoice = await this.prisma.tuitionInvoice.create({
        data: {
          studentId: dto.studentId,
          period: dto.period,
          amount: dto.amount,
          dueDate: parseDateOnly(dto.dueDate),
          note: dto.note ?? null,
        },
        include: INVOICE_INCLUDE,
      });
      return { message: 'Đã tạo khoản học phí.', data: invoice };
    } catch (error: unknown) {
      this.throwIfDuplicate(error);
      throw error;
    }
  }

  async update(id: string, dto: UpdateInvoiceDto) {
    if (Object.values(dto).every((value) => value === undefined)) {
      throw new BadRequestException('Cần cung cấp ít nhất một trường để cập nhật.');
    }

    await this.assertExists(id);

    try {
      const invoice = await this.prisma.tuitionInvoice.update({
        where: { id },
        data: {
          ...(dto.period !== undefined ? { period: dto.period } : {}),
          ...(dto.amount !== undefined ? { amount: dto.amount } : {}),
          ...(dto.dueDate !== undefined ? { dueDate: parseDateOnly(dto.dueDate) } : {}),
          ...(dto.status !== undefined ? { status: dto.status } : {}),
          ...(dto.note !== undefined ? { note: dto.note } : {}),
        },
        include: INVOICE_INCLUDE,
      });
      return { message: 'Đã cập nhật khoản học phí.', data: invoice };
    } catch (error: unknown) {
      this.throwIfDuplicate(error);
      throw error;
    }
  }

  async remove(id: string) {
    await this.assertExists(id);
    await this.prisma.tuitionInvoice.delete({ where: { id } });
    return { message: 'Đã xóa khoản học phí.' };
  }

  async markPaid(id: string) {
    const existing = await this.assertExists(id);
    if (existing.status === InvoiceStatus.PAID) {
      throw new BadRequestException('Khoản học phí này đã được ghi nhận thanh toán.');
    }

    const invoice = await this.prisma.tuitionInvoice.update({
      where: { id },
      data: { status: InvoiceStatus.PAID },
      include: INVOICE_INCLUDE,
    });

    return { message: 'Đã xác nhận đã nhận học phí.', data: invoice };
  }

  private async assertExists(id: string) {
    const invoice = await this.prisma.tuitionInvoice.findUnique({
      where: { id },
      select: { id: true, status: true },
    });
    if (!invoice) {
      throw new NotFoundException('Không tìm thấy khoản học phí.');
    }
    return invoice;
  }

  private throwIfDuplicate(error: unknown) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new ConflictException('Học viên đã có khoản học phí cho kỳ này.');
    }
  }
}
