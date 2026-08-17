import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Role, StudentStatus } from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateStudentDto,
  ListStudentsQueryDto,
  UpdateStudentDto,
} from './dto/student.dto';

const STUDENT_INCLUDE = {
  enrollments: {
    where: { leftAt: null },
    include: {
      class: {
        select: { id: true, name: true, status: true },
      },
    },
    orderBy: { joinedAt: 'desc' as const },
  },
  parents: {
    include: {
      parent: {
        select: { id: true, fullName: true, email: true, phone: true },
      },
    },
    orderBy: { createdAt: 'asc' as const },
  },
} satisfies Prisma.StudentInclude;

@Injectable()
export class StudentsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: ListStudentsQueryDto) {
    const search = query.search?.trim();
    const where: Prisma.StudentWhereInput = {
      ...(query.status ? { status: query.status } : {}),
      ...(search
        ? {
            OR: [
              { fullName: { contains: search, mode: 'insensitive' } },
              { phone: { contains: search } },
              { email: { contains: search, mode: 'insensitive' } },
              { parentName: { contains: search, mode: 'insensitive' } },
              { parentPhone: { contains: search } },
            ],
          }
        : {}),
    };

    const [totalItems, data] = await this.prisma.$transaction([
      this.prisma.student.count({ where }),
      this.prisma.student.findMany({
        where,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
        include: {
          _count: {
            select: { enrollments: { where: { leftAt: null } } },
          },
          parents: {
            select: {
              parentUserId: true,
              parent: { select: { id: true, fullName: true, email: true } },
            },
          },
        },
      }),
    ]);

    return {
      data: data.map(({ _count, ...student }) => ({
        ...student,
        classCount: _count.enrollments,
      })),
      meta: {
        totalItems,
        totalPages: Math.ceil(totalItems / query.pageSize) || 1,
        currentPage: query.page,
        pageSize: query.pageSize,
      },
    };
  }

  async findOne(id: string) {
    const student = await this.prisma.student.findUnique({
      where: { id },
      include: STUDENT_INCLUDE,
    });
    if (!student) {
      throw new NotFoundException('Không tìm thấy học viên.');
    }
    return { data: student };
  }

  async create(dto: CreateStudentDto) {
    const parentUserIds = dto.parentUserIds ?? [];
    await this.assertParentUsers(parentUserIds);

    const student = await this.prisma.student.create({
      data: {
        fullName: this.normalizeName(dto.fullName),
        phone: dto.phone ?? null,
        email: dto.email?.toLowerCase() ?? null,
        parentName: dto.parentName ? this.normalizeName(dto.parentName) : null,
        parentPhone: dto.parentPhone ?? null,
        status: dto.status ?? StudentStatus.STUDYING,
        note: dto.note ?? null,
        parents:
          parentUserIds.length > 0
            ? {
                create: parentUserIds.map((parentUserId) => ({ parentUserId })),
              }
            : undefined,
      },
      include: STUDENT_INCLUDE,
    });

    return { message: 'Đã tạo học viên.', data: student };
  }

  async update(id: string, dto: UpdateStudentDto) {
    if (Object.values(dto).every((value) => value === undefined)) {
      throw new BadRequestException('Cần cung cấp ít nhất một trường để cập nhật.');
    }

    const existing = await this.prisma.student.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existing) {
      throw new NotFoundException('Không tìm thấy học viên cần cập nhật.');
    }

    if (dto.parentUserIds) {
      await this.assertParentUsers(dto.parentUserIds);
    }

    const student = await this.prisma.$transaction(async (tx) => {
      if (dto.parentUserIds) {
        await tx.studentParent.deleteMany({ where: { studentId: id } });
        if (dto.parentUserIds.length > 0) {
          await tx.studentParent.createMany({
            data: dto.parentUserIds.map((parentUserId) => ({
              studentId: id,
              parentUserId,
            })),
          });
        }
      }

      return tx.student.update({
        where: { id },
        data: {
          ...(dto.fullName !== undefined
            ? { fullName: this.normalizeName(dto.fullName) }
            : {}),
          ...(dto.phone !== undefined ? { phone: dto.phone } : {}),
          ...(dto.email !== undefined
            ? { email: dto.email?.toLowerCase() ?? null }
            : {}),
          ...(dto.parentName !== undefined
            ? {
                parentName: dto.parentName
                  ? this.normalizeName(dto.parentName)
                  : null,
              }
            : {}),
          ...(dto.parentPhone !== undefined ? { parentPhone: dto.parentPhone } : {}),
          ...(dto.status !== undefined ? { status: dto.status } : {}),
          ...(dto.note !== undefined ? { note: dto.note } : {}),
        },
        include: STUDENT_INCLUDE,
      });
    });

    return { message: 'Đã cập nhật học viên.', data: student };
  }

  async remove(id: string) {
    const existing = await this.prisma.student.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existing) {
      throw new NotFoundException('Không tìm thấy học viên cần xóa.');
    }

    const student = await this.prisma.student.update({
      where: { id },
      data: { status: StudentStatus.FINISHED },
      include: STUDENT_INCLUDE,
    });

    return {
      message: 'Đã chuyển học viên sang trạng thái kết thúc.',
      data: student,
    };
  }

  async linkParent(studentId: string, parentUserId: string) {
    await this.assertStudentExists(studentId);
    await this.assertParentUsers([parentUserId]);

    try {
      await this.prisma.studentParent.create({
        data: { studentId, parentUserId },
      });
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new BadRequestException('Phụ huynh này đã được gắn với học viên.');
      }
      throw error;
    }

    return this.findOne(studentId);
  }

  async unlinkParent(studentId: string, parentUserId: string) {
    await this.assertStudentExists(studentId);

    const deleted = await this.prisma.studentParent.deleteMany({
      where: { studentId, parentUserId },
    });
    if (deleted.count === 0) {
      throw new NotFoundException('Không tìm thấy liên kết phụ huynh.');
    }

    return { message: 'Đã gỡ liên kết phụ huynh.' };
  }

  private async assertStudentExists(id: string) {
    const student = await this.prisma.student.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!student) {
      throw new NotFoundException('Không tìm thấy học viên.');
    }
  }

  private async assertParentUsers(ids: string[]) {
    if (ids.length === 0) return;

    const users = await this.prisma.user.findMany({
      where: { id: { in: ids } },
      select: { id: true, role: true },
    });

    if (users.length !== ids.length) {
      throw new BadRequestException('Không tìm thấy tài khoản phụ huynh.');
    }

    const invalid = users.find((user) => user.role !== Role.PARENT);
    if (invalid) {
      throw new BadRequestException('Tài khoản được chọn không phải phụ huynh.');
    }
  }

  private normalizeName(value: string) {
    return value.trim().replace(/\s+/g, ' ');
  }
}
