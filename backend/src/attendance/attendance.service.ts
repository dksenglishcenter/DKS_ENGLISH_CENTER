import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AttendanceStatus, Role } from '../../generated/prisma/client';
import { ClassesService } from '../classes/classes.service';
import { assertSessionFitsClass } from '../classes/class-schedule';
import {
  formatDateOnly,
  parseDateOnly,
} from '../common/validation/date-only';
import { PrismaService } from '../prisma/prisma.service';
import type {
  AttendanceRangeQueryDto,
  OpenSessionDto,
  SaveAttendanceDto,
} from './dto/attendance.dto';

type Actor = { id: string; role: string };

@Injectable()
export class AttendanceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly classesService: ClassesService,
  ) {}

  async openSession(classId: string, dto: OpenSessionDto, actor: Actor) {
    const classGroup = await this.classesService.getOwnedClass(classId, actor);
    const date = parseDateOnly(dto.date);
    assertSessionFitsClass({
      date,
      scheduleDays: classGroup.scheduleDays,
      startsOn: classGroup.startsOn ?? classGroup.course?.startDate ?? null,
      endsOn: classGroup.endsOn ?? classGroup.course?.endDate ?? null,
    });

    const session = await this.prisma.classSession.upsert({
      where: { classId_date: { classId, date } },
      create: { classId, date, note: dto.note ?? null },
      update: dto.note !== undefined ? { note: dto.note } : {},
    });

    return { message: 'Đã mở buổi học.', data: this.serializeSession(session) };
  }

  async saveAttendance(sessionId: string, dto: SaveAttendanceDto, actor: Actor) {
    const session = await this.prisma.classSession.findUnique({
      where: { id: sessionId },
      select: { id: true, classId: true, date: true },
    });
    if (!session) {
      throw new NotFoundException('Không tìm thấy buổi học.');
    }

    await this.classesService.getOwnedClass(session.classId, actor);

    const studentIds = dto.records.map((record) => record.studentId);
    const uniqueIds = new Set(studentIds);
    if (uniqueIds.size !== studentIds.length) {
      throw new BadRequestException('Danh sách điểm danh có học viên trùng.');
    }

    const enrolled = await this.prisma.enrollment.findMany({
      where: {
        classId: session.classId,
        studentId: { in: studentIds },
        leftAt: null,
      },
      select: { studentId: true },
    });
    if (enrolled.length !== studentIds.length) {
      throw new BadRequestException(
        'Chỉ được điểm danh học viên đang học trong lớp.',
      );
    }

    await this.prisma.$transaction(
      dto.records.map((record) =>
        this.prisma.attendanceRecord.upsert({
          where: {
            sessionId_studentId: {
              sessionId,
              studentId: record.studentId,
            },
          },
          create: {
            sessionId,
            studentId: record.studentId,
            status: record.status,
            note: record.note ?? null,
            markedAt: new Date(),
          },
          update: {
            status: record.status,
            note: record.note ?? null,
            markedAt: new Date(),
          },
        }),
      ),
    );

    const saved = await this.prisma.classSession.findUnique({
      where: { id: sessionId },
      include: {
        attendances: {
          include: {
            student: { select: { id: true, fullName: true } },
          },
          orderBy: { student: { fullName: 'asc' } },
        },
      },
    });

    return {
      message: 'Đã lưu điểm danh.',
      data: saved ? this.serializeSessionWithRecords(saved) : null,
    };
  }

  async historyByClass(
    classId: string,
    query: AttendanceRangeQueryDto,
    actor: Actor,
  ) {
    await this.classesService.getOwnedClass(classId, actor);

    const from = query.from ? parseDateOnly(query.from) : undefined;
    const to = query.to ? parseDateOnly(query.to) : undefined;
    if (from && to && from > to) {
      throw new BadRequestException('Khoảng ngày không hợp lệ.');
    }

    const sessions = await this.prisma.classSession.findMany({
      where: {
        classId,
        ...(from || to
          ? { date: { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) } }
          : {}),
      },
      include: {
        attendances: {
          include: {
            student: { select: { id: true, fullName: true } },
          },
          orderBy: { student: { fullName: 'asc' } },
        },
      },
      orderBy: { date: 'desc' },
    });

    const rates = this.computeStudentRates(
      sessions.flatMap((session) => session.attendances),
    );

    return {
      data: {
        sessions: sessions.map((session) => this.serializeSessionWithRecords(session)),
        rates,
      },
    };
  }

  async historyByStudent(studentId: string, actor: Actor) {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      select: { id: true, fullName: true },
    });
    if (!student) {
      throw new NotFoundException('Không tìm thấy học viên.');
    }

    if (actor.role === Role.TEACHER) {
      const taught = await this.prisma.enrollment.findFirst({
        where: {
          studentId,
          leftAt: null,
          class: { teacherId: actor.id },
        },
        select: { id: true },
      });
      if (!taught) {
        throw new NotFoundException('Không tìm thấy học viên trong lớp của bạn.');
      }
    } else if (actor.role !== Role.ADMIN) {
      throw new NotFoundException('Không tìm thấy học viên.');
    }

    const records = await this.prisma.attendanceRecord.findMany({
      where: {
        studentId,
        ...(actor.role === Role.TEACHER
          ? { session: { class: { teacherId: actor.id } } }
          : {}),
      },
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
        records: records.map((record) => ({
          id: record.id,
          status: record.status,
          note: record.note,
          markedAt: record.markedAt,
          sessionId: record.session.id,
          date: formatDateOnly(record.session.date),
          class: record.session.class,
        })),
        rate: this.rateFromStatuses(records.map((record) => record.status)),
      },
    };
  }

  private serializeSession(session: { id: string; classId: string; date: Date; note: string | null }) {
    return {
      id: session.id,
      classId: session.classId,
      date: formatDateOnly(session.date),
      note: session.note,
    };
  }

  private serializeSessionWithRecords(session: {
    id: string;
    classId: string;
    date: Date;
    note: string | null;
    attendances: Array<{
      id: string;
      studentId: string;
      status: AttendanceStatus;
      note: string | null;
      markedAt: Date;
      student: { id: string; fullName: string };
    }>;
  }) {
    return {
      ...this.serializeSession(session),
      attendances: session.attendances.map((record) => ({
        id: record.id,
        studentId: record.studentId,
        status: record.status,
        note: record.note,
        markedAt: record.markedAt,
        student: record.student,
      })),
    };
  }

  private computeStudentRates(
    records: Array<{ studentId: string; status: AttendanceStatus; student: { fullName: string } }>,
  ) {
    const byStudent = new Map<
      string,
      { studentId: string; fullName: string; statuses: AttendanceStatus[] }
    >();

    for (const record of records) {
      const current = byStudent.get(record.studentId) ?? {
        studentId: record.studentId,
        fullName: record.student.fullName,
        statuses: [],
      };
      current.statuses.push(record.status);
      byStudent.set(record.studentId, current);
    }

    return [...byStudent.values()].map((item) => ({
      studentId: item.studentId,
      fullName: item.fullName,
      rate: this.rateFromStatuses(item.statuses),
    }));
  }

  private rateFromStatuses(statuses: AttendanceStatus[]) {
    const total = statuses.length;
    const attended = statuses.filter(
      (status) => status === AttendanceStatus.PRESENT || status === AttendanceStatus.LATE,
    ).length;
    return {
      total,
      present: statuses.filter((status) => status === AttendanceStatus.PRESENT).length,
      late: statuses.filter((status) => status === AttendanceStatus.LATE).length,
      absent: statuses.filter((status) => status === AttendanceStatus.ABSENT).length,
      percent: total === 0 ? 0 : Math.round((attended / total) * 100),
    };
  }
}
