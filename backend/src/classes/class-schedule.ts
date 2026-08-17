import { BadRequestException } from '@nestjs/common';
import { formatDateOnly } from '../common/validation/date-only';

export const WEEKDAY_LABELS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'] as const;
const WEEKDAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

export function formatScheduleDays(days: number[]): string {
  return WEEKDAY_ORDER.filter((day) => days.includes(day))
    .map((day) => WEEKDAY_LABELS[day])
    .join(', ');
}

export function assertSessionFitsClass(params: {
  date: Date;
  scheduleDays: number[];
  startsOn: Date | null;
  endsOn: Date | null;
}) {
  const { date, scheduleDays, startsOn, endsOn } = params;

  if (scheduleDays.length > 0 && !scheduleDays.includes(date.getUTCDay())) {
    throw new BadRequestException(
      `Ngày này không nằm trong lịch lớp (${formatScheduleDays(scheduleDays)}).`,
    );
  }

  if (startsOn && date.getTime() < startsOn.getTime()) {
    throw new BadRequestException(
      `Ngày điểm danh phải từ ${formatDateOnly(startsOn)} trở đi.`,
    );
  }

  if (endsOn && date.getTime() > endsOn.getTime()) {
    throw new BadRequestException(
      `Ngày điểm danh không được sau ${formatDateOnly(endsOn)}.`,
    );
  }
}
