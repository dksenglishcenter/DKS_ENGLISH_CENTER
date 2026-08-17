import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Role } from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateClassDto,
  ListClassesQueryDto,
  UpdateClassDto,
} from './dto/class.dto';

const CLASS_LIST_INCLUDE = {
  teacher: { select: { id: true, fullName: true, email: true } },
  course: { select: { id: true, title: true, slug: true } },
  _count: { select: { enrollments: { where: { leftAt: null } } } },
} satisfies Prisma.ClassGroupInclude;

const CLASS_DETAIL_INCLUDE = {
  teacher: { select: { id: true, fullName: true, email: true, role: true } },
  course: { select: { id: true, title: true, slug: true } },
  enrollments: {
    where: { leftAt: null },
    include: {
      student: {
        select: {
          id: true,
          fullName: true,
          phone: true,
          email: true,
          status: true,
        },
      },
    },
    orderBy: { student: { fullName: 'asc' as const } },
  },
} satisfies Prisma.ClassGroupInclude;

@Injectable()
export class ClassesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: ListClassesQueryDto) {
    const search = query.search?.trim();
    const where: Prisma.ClassGroupWhereInput = {
      ...(query.status ? { status: query.status } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { room: { contains: search, mode: 'insensitive' } },
              { teacher: { fullName: { contains: search, mode: 'insensitive' } } },
            ],
          }
        : {}),
    };

    const [totalItems, rows] = await this.prisma.$transaction([
      this.prisma.classGroup.count({ where }),
      this.prisma.classGroup.findMany({
        where,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
        include: CLASS_LIST_INCLUDE,
      }),
    ]);

    return {
      data: rows.map(this.toListItem),
      meta: {
        totalItems,
        totalPages: Math.ceil(totalItems / query.pageSize) || 1,
        currentPage: query.page,
        pageSize: query.pageSize,
      },
    };
  }

  async listMine(teacherId: string) {
    const rows = await this.prisma.classGroup.findMany({
      where: { teacherId },
      orderBy: [{ status: 'asc' }, { name: 'asc' }],
      include: CLASS_LIST_INCLUDE,
    });
    return { data: rows.map(this.toListItem) };
  }

  async findOne(id: string, actor: { id: string; role: string }) {
    const classGroup = await this.prisma.classGroup.findUnique({
      where: { id },
      include: CLASS_DETAIL_INCLUDE,
    });
    if (!classGroup) {
      throw new NotFoundException('Không tìm thấy lớp học.');
    }
    this.assertCanAccessClass(classGroup.teacherId, actor);
    return { data: this.toDetail(classGroup) };
  }

  async create(dto: CreateClassDto) {
    await this.assertTeacherId(dto.teacherId);
    await this.assertCourseId(dto.courseId);

    const classGroup = await this.prisma.classGroup.create({
      data: {
        name: this.normalizeName(dto.name),
        courseId: dto.courseId ?? null,
        level: dto.level ?? null,
        teacherId: dto.teacherId ?? null,
        scheduleDays: dto.scheduleDays ?? [],
        startTime: dto.startTime ?? null,
        endTime: dto.endTime ?? null,
        room: dto.room ?? null,
        capacity: dto.capacity ?? null,
        status: dto.status,
      },
      include: CLASS_DETAIL_INCLUDE,
    });

    return { message: 'Đã tạo lớp học.', data: this.toDetail(classGroup) };
  }

  async update(id: string, dto: UpdateClassDto) {
    if (Object.values(dto).every((value) => value === undefined)) {
      throw new BadRequestException('Cần cung cấp ít nhất một trường để cập nhật.');
    }

    await this.assertClassExists(id);
    if (dto.teacherId !== undefined) {
      await this.assertTeacherId(dto.teacherId);
    }
    if (dto.courseId !== undefined) {
      await this.assertCourseId(dto.courseId);
    }

    if (dto.capacity !== undefined && dto.capacity !== null) {
      const active = await this.countActiveEnrollments(id);
      if (active > dto.capacity) {
        throw new BadRequestException(
          `Sĩ số mới (${dto.capacity}) nhỏ hơn số học viên đang học (${active}).`,
        );
      }
    }

    const classGroup = await this.prisma.classGroup.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: this.normalizeName(dto.name) } : {}),
        ...(dto.courseId !== undefined ? { courseId: dto.courseId } : {}),
        ...(dto.level !== undefined ? { level: dto.level } : {}),
        ...(dto.teacherId !== undefined ? { teacherId: dto.teacherId } : {}),
        ...(dto.scheduleDays !== undefined ? { scheduleDays: dto.scheduleDays } : {}),
        ...(dto.startTime !== undefined ? { startTime: dto.startTime } : {}),
        ...(dto.endTime !== undefined ? { endTime: dto.endTime } : {}),
        ...(dto.room !== undefined ? { room: dto.room } : {}),
        ...(dto.capacity !== undefined ? { capacity: dto.capacity } : {}),
        ...(dto.status !== undefined ? { status: dto.status } : {}),
      },
      include: CLASS_DETAIL_INCLUDE,
    });

    return { message: 'Đã cập nhật lớp học.', data: this.toDetail(classGroup) };
  }

  async remove(id: string) {
    await this.assertClassExists(id);
    await this.prisma.classGroup.delete({ where: { id } });
    return { message: 'Đã xóa lớp học.' };
  }

  async enroll(classId: string, studentId: string) {
    const classGroup = await this.prisma.classGroup.findUnique({
      where: { id: classId },
      select: { id: true, capacity: true },
    });
    if (!classGroup) {
      throw new NotFoundException('Không tìm thấy lớp học.');
    }

    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      select: { id: true },
    });
    if (!student) {
      throw new NotFoundException('Không tìm thấy học viên.');
    }

    const existing = await this.prisma.enrollment.findUnique({
      where: { studentId_classId: { studentId, classId } },
    });

    if (existing && !existing.leftAt) {
      throw new BadRequestException('Học viên đã có trong lớp này.');
    }

    const active = await this.countActiveEnrollments(classId);
    if (classGroup.capacity !== null && active >= classGroup.capacity) {
      throw new BadRequestException('Lớp đã đủ sĩ số, không thể thêm học viên.');
    }

    if (existing) {
      await this.prisma.enrollment.update({
        where: { id: existing.id },
        data: { leftAt: null, joinedAt: new Date() },
      });
    } else {
      await this.prisma.enrollment.create({
        data: { studentId, classId },
      });
    }

    return {
      message: 'Đã thêm học viên vào lớp.',
      ...(await this.findOne(classId, { id: '', role: Role.ADMIN })),
    };
  }

  async unenroll(classId: string, studentId: string) {
    await this.assertClassExists(classId);

    const existing = await this.prisma.enrollment.findUnique({
      where: { studentId_classId: { studentId, classId } },
    });
    if (!existing || existing.leftAt) {
      throw new NotFoundException('Học viên không còn trong lớp này.');
    }

    await this.prisma.enrollment.update({
      where: { id: existing.id },
      data: { leftAt: new Date() },
    });

    return { message: 'Đã gỡ học viên khỏi lớp.' };
  }

  async getOwnedClass(classId: string, actor: { id: string; role: string }) {
    const classGroup = await this.prisma.classGroup.findUnique({
      where: { id: classId },
      select: { id: true, teacherId: true, name: true },
    });
    if (!classGroup) {
      throw new NotFoundException('Không tìm thấy lớp học.');
    }
    this.assertCanAccessClass(classGroup.teacherId, actor);
    return classGroup;
  }

  assertCanAccessClass(
    teacherId: string | null,
    actor: { id: string; role: string },
  ) {
    if (actor.role === Role.ADMIN) return;
    if (actor.role === Role.TEACHER && teacherId === actor.id) return;
    throw new ForbiddenException('Bạn không có quyền thao tác lớp này.');
  }

  private toListItem(
    row: Prisma.ClassGroupGetPayload<{ include: typeof CLASS_LIST_INCLUDE }>,
  ) {
    const { _count, ...rest } = row;
    return { ...rest, studentCount: _count.enrollments };
  }

  private toDetail(
    row: Prisma.ClassGroupGetPayload<{ include: typeof CLASS_DETAIL_INCLUDE }>,
  ) {
    return {
      ...row,
      studentCount: row.enrollments.length,
    };
  }

  private async countActiveEnrollments(classId: string) {
    return this.prisma.enrollment.count({
      where: { classId, leftAt: null },
    });
  }

  private async assertClassExists(id: string) {
    const classGroup = await this.prisma.classGroup.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!classGroup) {
      throw new NotFoundException('Không tìm thấy lớp học.');
    }
  }

  private async assertTeacherId(teacherId: string | null | undefined) {
    if (!teacherId) return;
    const user = await this.prisma.user.findUnique({
      where: { id: teacherId },
      select: { role: true },
    });
    if (!user) {
      throw new BadRequestException('Không tìm thấy giáo viên.');
    }
    if (user.role !== Role.TEACHER) {
      throw new BadRequestException('Giáo viên phải là tài khoản có quyền TEACHER.');
    }
  }

  private async assertCourseId(courseId: string | null | undefined) {
    if (!courseId) return;
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true },
    });
    if (!course) {
      throw new BadRequestException('Không tìm thấy khóa học.');
    }
  }

  private normalizeName(value: string) {
    return value.trim().replace(/\s+/g, ' ');
  }
}
