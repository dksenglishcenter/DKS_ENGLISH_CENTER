import { BadRequestException } from '@nestjs/common';

export const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
export const PERIOD_PATTERN = /^\d{4}-\d{2}$/;

export function parseDateOnly(value: string): Date {
  if (!DATE_ONLY_PATTERN.test(value)) {
    throw new BadRequestException('Ngày phải có định dạng YYYY-MM-DD.');
  }
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) {
    throw new BadRequestException('Ngày không hợp lệ.');
  }
  return date;
}

export function formatDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function utcToday(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

export function parseOptionalDateOnly(
  value: string | null | undefined,
): Date | null | undefined {
  if (value === undefined) return undefined;
  if (value === null || value === '') return null;
  return parseDateOnly(value);
}

export function optionalDateOnly(date: Date | null | undefined): string | null {
  return date ? formatDateOnly(date) : null;
}

export function addDaysIso(date: string, days: number): string {
  const next = new Date(`${date}T00:00:00.000Z`);
  next.setUTCDate(next.getUTCDate() + days);
  return next.toISOString().slice(0, 10);
}

export function assertDateRange(
  start: Date | null | undefined,
  end: Date | null | undefined,
  startLabel = 'Ngày bắt đầu khóa',
  endLabel = 'Ngày kết thúc khóa',
) {
  if (start && end && end.getTime() < start.getTime()) {
    throw new BadRequestException(
      `${endLabel} phải sau hoặc bằng ${startLabel.toLowerCase()}.`,
    );
  }
}
