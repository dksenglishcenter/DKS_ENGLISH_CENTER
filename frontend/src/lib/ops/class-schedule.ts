export const WEEKDAYS = [
  { value: 1, label: "T2" },
  { value: 2, label: "T3" },
  { value: 3, label: "T4" },
  { value: 4, label: "T5" },
  { value: 5, label: "T6" },
  { value: 6, label: "T7" },
  { value: 0, label: "CN" },
] as const;

export function weekdayFromIso(date: string): number {
  return new Date(`${date}T00:00:00.000Z`).getUTCDay();
}

export function formatScheduleDays(days: number[]): string {
  if (!days.length) return "mọi ngày";
  return WEEKDAYS.filter((day) => days.includes(day.value))
    .map((day) => day.label)
    .join(", ");
}

export function isScheduledDay(date: string, scheduleDays: number[]): boolean {
  if (!scheduleDays.length) return true;
  return scheduleDays.includes(weekdayFromIso(date));
}

export function attendanceWindow(cls: {
  startsOn?: string | null;
  endsOn?: string | null;
  course?: { startDate?: string | null; endDate?: string | null } | null;
}): { min?: string; max?: string } {
  const min = cls.startsOn || cls.course?.startDate || undefined;
  const max = cls.endsOn || cls.course?.endDate || undefined;
  return { min, max };
}

export function nextScheduledDate(
  from: string,
  scheduleDays: number[],
  min?: string,
  max?: string,
): string {
  const start = min && from < min ? min : from;
  for (let i = 0; i < 60; i += 1) {
    const candidate = addDaysIso(start, i);
    if (max && candidate > max) break;
    if (isScheduledDay(candidate, scheduleDays)) return candidate;
  }
  return from;
}

function addDaysIso(date: string, days: number): string {
  const next = new Date(`${date}T00:00:00.000Z`);
  next.setUTCDate(next.getUTCDate() + days);
  return next.toISOString().slice(0, 10);
}

export function attendanceDateError(
  date: string,
  cls:
    | {
        scheduleDays: number[];
        startsOn?: string | null;
        endsOn?: string | null;
        course?: { startDate?: string | null; endDate?: string | null } | null;
      }
    | undefined,
): string | null {
  if (!cls || !date) return null;
  if (!isScheduledDay(date, cls.scheduleDays)) {
    return `Lớp chỉ học ${formatScheduleDays(cls.scheduleDays)}.`;
  }
  const { min, max } = attendanceWindow(cls);
  if (min && date < min) return `Khóa bắt đầu từ ${min}.`;
  if (max && date > max) return `Khóa kết thúc vào ${max}.`;
  return null;
}
