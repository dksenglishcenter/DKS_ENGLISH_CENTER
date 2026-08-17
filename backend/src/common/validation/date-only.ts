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
