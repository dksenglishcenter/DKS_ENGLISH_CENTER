import { AttendanceStatus } from '../../generated/prisma/client';
import {
  addDaysIso,
  formatDateOnly,
  optionalDateOnly,
} from '../common/validation/date-only';

export type ParentSessionKind = 'marked' | 'opened' | 'upcoming' | 'planned';

export type ParentSessionRow = {
  date: string;
  sessionId: string | null;
  status: AttendanceStatus | null;
  note: string | null;
  kind: ParentSessionKind;
};

type SessionInput = {
  id: string;
  date: Date;
  attendances: Array<{ status: AttendanceStatus; note: string | null }>;
};

export function buildParentClassTimeline(params: {
  scheduleDays: number[];
  startsOn: string | null;
  endsOn: string | null;
  sessions: SessionInput[];
  today: string;
}): ParentSessionRow[] {
  const byDate = new Map<
    string,
    { sessionId: string; status: AttendanceStatus | null; note: string | null }
  >();

  for (const session of params.sessions) {
    const date = formatDateOnly(session.date);
    const attendance = session.attendances[0];
    byDate.set(date, {
      sessionId: session.id,
      status: attendance?.status ?? null,
      note: attendance?.note ?? null,
    });
  }

  const dates = new Set(byDate.keys());

  if (params.startsOn) {
    const rangeEnd = params.endsOn ?? params.today;
    let cursor = params.startsOn;
    let guard = 0;
    while (cursor <= rangeEnd && guard < 400) {
      const weekday = new Date(`${cursor}T00:00:00.000Z`).getUTCDay();
      if (
        params.scheduleDays.length === 0 ||
        params.scheduleDays.includes(weekday)
      ) {
        dates.add(cursor);
      }
      cursor = addDaysIso(cursor, 1);
      guard += 1;
    }
  }

  return [...dates]
    .sort((a, b) => b.localeCompare(a))
    .map((date) => {
      const hit = byDate.get(date);
      if (hit) {
        return {
          date,
          sessionId: hit.sessionId,
          status: hit.status,
          note: hit.note,
          kind: hit.status ? ('marked' as const) : ('opened' as const),
        };
      }
      return {
        date,
        sessionId: null,
        status: null,
        note: null,
        kind: date > params.today ? ('upcoming' as const) : ('planned' as const),
      };
    });
}

export function rateFromStatuses(statuses: AttendanceStatus[]) {
  const total = statuses.length;
  const attended = statuses.filter(
    (status) =>
      status === AttendanceStatus.PRESENT || status === AttendanceStatus.LATE,
  ).length;
  return {
    total,
    present: statuses.filter((status) => status === AttendanceStatus.PRESENT)
      .length,
    late: statuses.filter((status) => status === AttendanceStatus.LATE).length,
    absent: statuses.filter((status) => status === AttendanceStatus.ABSENT)
      .length,
    percent: total === 0 ? 0 : Math.round((attended / total) * 100),
  };
}

export function resolveClassWindow(params: {
  startsOn: Date | null;
  endsOn: Date | null;
  courseStart: Date | null | undefined;
  courseEnd: Date | null | undefined;
}) {
  return {
    startsOn:
      optionalDateOnly(params.startsOn) ??
      optionalDateOnly(params.courseStart ?? null),
    endsOn:
      optionalDateOnly(params.endsOn) ??
      optionalDateOnly(params.courseEnd ?? null),
  };
}
