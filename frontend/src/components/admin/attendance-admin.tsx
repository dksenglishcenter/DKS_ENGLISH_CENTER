"use client";

import { useEffect, useMemo, useState } from "react";

import { useAdminUser } from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatAdminDate } from "@/lib/admin/format";
import { formatError } from "@/lib/errors/format-error";
import {
  getClass,
  getClassAttendance,
  listClasses,
  listMyClasses,
  openSession,
  saveAttendance,
} from "@/lib/ops/api";
import type { AttendanceStatus, ClassGroup, ClassSession } from "@/lib/ops/types";

function todayIso() {
  const now = new Date();
  const tz = now.getTime() - now.getTimezoneOffset() * 60_000;
  return new Date(tz).toISOString().slice(0, 10);
}

function monthRange(date: string) {
  const [year, month] = date.split("-").map(Number);
  const from = `${year}-${String(month).padStart(2, "0")}-01`;
  const last = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const to = `${year}-${String(month).padStart(2, "0")}-${String(last).padStart(2, "0")}`;
  return { from, to };
}

const STATUS_BTN: Array<{ value: AttendanceStatus; label: string; active: string }> = [
  { value: "PRESENT", label: "Có mặt", active: "bg-emerald-600 text-white" },
  { value: "ABSENT", label: "Vắng", active: "bg-red-600 text-white" },
  { value: "LATE", label: "Muộn", active: "bg-amber-500 text-white" },
];

export function AttendanceAdmin() {
  const user = useAdminUser();
  const isTeacher = user.role === "TEACHER";
  const [classes, setClasses] = useState<ClassGroup[]>([]);
  const [classId, setClassId] = useState("");
  const [date, setDate] = useState(todayIso);
  const [marks, setMarks] = useState<Record<string, AttendanceStatus>>({});
  const [roster, setRoster] = useState<Array<{ id: string; fullName: string }>>([]);
  const [history, setHistory] = useState<ClassSession[]>([]);
  const [rates, setRates] = useState<Array<{ studentId: string; fullName: string; rate: { percent: number; total: number } }>>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    const load = isTeacher ? listMyClasses() : listClasses({ pageSize: 100 });
    void load
      .then((response) => {
        const rows = "meta" in response ? response.data : response.data;
        setClasses(rows);
        if (rows[0]) setClassId(rows[0].id);
      })
      .catch((err) => setError(formatError(err)));
  }, [isTeacher]);

  async function loadClassDay(nextClassId: string, nextDate: string) {
    if (!nextClassId) return;
    setLoading(true);
    setError(null);
    try {
      const [detail, month] = await Promise.all([
        getClass(nextClassId),
        getClassAttendance(nextClassId, monthRange(nextDate)),
      ]);
      const students = (detail.data.enrollments ?? []).map((item) => item.student);
      setRoster(students);
      const daySession = month.data.sessions.find((session) => session.date === nextDate);
      const nextMarks: Record<string, AttendanceStatus> = {};
      for (const student of students) {
        const existing = daySession?.attendances?.find((record) => record.studentId === student.id);
        nextMarks[student.id] = existing?.status ?? "PRESENT";
      }
      setMarks(nextMarks);
      setHistory(month.data.sessions);
      setRates(month.data.rates);
    } catch (err) {
      setError(formatError(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!classId) return;
    void loadClassDay(classId, date);
  }, [classId, date]);

  const allPresent = useMemo(
    () => roster.length > 0 && roster.every((student) => marks[student.id] === "PRESENT"),
    [roster, marks],
  );

  async function handleSave() {
    if (!classId || roster.length === 0) return;
    setSaving(true);
    setError(null);
    try {
      const session = await openSession(classId, date);
      await saveAttendance(
        session.data.id,
        roster.map((student) => ({ studentId: student.id, status: marks[student.id] ?? "PRESENT" })),
      );
      setNotice("Đã lưu điểm danh.");
      await loadClassDay(classId, date);
    } catch (err) {
      setError(formatError(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-black font-[family-name:var(--font-nunito)]">Điểm danh</h2>
        <p className="text-sm text-muted-foreground">Chọn lớp và ngày, lưu một lần cho cả buổi.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm">
          <span className="mb-1 block font-semibold">Lớp</span>
          <select
            className="h-12 w-full rounded-lg border border-border bg-card px-3 text-sm font-semibold"
            value={classId}
            onChange={(event) => setClassId(event.target.value)}
          >
            {classes.length === 0 ? <option value="">Chưa có lớp</option> : null}
            {classes.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-semibold">Ngày</span>
          <Input type="date" className="h-12" value={date} onChange={(event) => setDate(event.target.value)} />
        </label>
      </div>

      {notice ? (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {notice}
        </p>
      ) : null}
      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      ) : null}

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Button
          type="button"
          variant="outline"
          disabled={roster.length === 0}
          onClick={() => {
            const next: Record<string, AttendanceStatus> = {};
            for (const student of roster) next[student.id] = "PRESENT";
            setMarks(next);
          }}
        >
          {allPresent ? "Đã chọn tất cả có mặt" : "Tất cả có mặt"}
        </Button>
        <Button type="button" disabled={saving || roster.length === 0} onClick={() => void handleSave()}>
          {saving ? "Đang lưu..." : "Lưu điểm danh"}
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Đang tải danh sách...</p>
      ) : roster.length === 0 ? (
        <p className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
          Lớp chưa có học viên.
        </p>
      ) : (
        <ul className="space-y-3">
          {roster.map((student) => (
            <li
              key={student.id}
              className="rounded-2xl border border-border bg-card p-4"
            >
              <p className="mb-3 font-bold">{student.fullName}</p>
              <div className="grid grid-cols-3 gap-2">
                {STATUS_BTN.map((btn) => {
                  const active = marks[student.id] === btn.value;
                  return (
                    <button
                      key={btn.value}
                      type="button"
                      className={`h-11 rounded-xl text-sm font-bold ${
                        active ? btn.active : "bg-secondary text-foreground"
                      }`}
                      onClick={() => setMarks((current) => ({ ...current, [student.id]: btn.value }))}
                    >
                      {btn.label}
                    </button>
                  );
                })}
              </div>
            </li>
          ))}
        </ul>
      )}

      <section className="rounded-2xl border border-border bg-card p-4">
        <h3 className="mb-3 font-bold">Lịch sử tháng này</h3>
        {history.length === 0 ? (
          <p className="text-sm text-muted-foreground">Chưa có buổi nào trong tháng.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {history.map((session) => (
              <li key={session.id} className="flex justify-between gap-2">
                <span>{formatAdminDate(session.date)}</span>
                <span className="text-muted-foreground">
                  {session.attendances?.length ?? 0} HV
                </span>
              </li>
            ))}
          </ul>
        )}
        {rates.length > 0 ? (
          <div className="mt-4 space-y-2 border-t border-border pt-3">
            <p className="text-sm font-semibold">Tỷ lệ đi học</p>
            {rates.map((item) => (
              <div key={item.studentId} className="flex justify-between text-sm">
                <span>{item.fullName}</span>
                <span className="font-bold tabular-nums">{item.rate.percent}%</span>
              </div>
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
}
