"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, UserMinus, UserPlus } from "lucide-react";

import { useAdminUser } from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { formatError } from "@/lib/errors/format-error";
import { PAGE_PATHS } from "@/lib/navigation-paths";
import { enrollStudent, getClass, listStudents, unenrollStudent } from "@/lib/ops/api";
import type { ClassGroup, Student } from "@/lib/ops/types";

export function ClassDetailAdmin({ classId }: { classId: string }) {
  const user = useAdminUser();
  const readOnly = user.role === "TEACHER";
  const [klass, setKlass] = useState<ClassGroup | null>(null);
  const [candidates, setCandidates] = useState<Student[]>([]);
  const [selected, setSelected] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function reload() {
    setLoading(true);
    setError(null);
    try {
      const response = await getClass(classId);
      setKlass(response.data);
    } catch (err) {
      setError(formatError(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void reload();
  }, [classId]);

  useEffect(() => {
    if (readOnly) return;
    listStudents({ pageSize: 100, status: "STUDYING" })
      .then((response) => setCandidates(response.data))
      .catch(() => setCandidates([]));
  }, [readOnly]);

  const enrolledIds = new Set(klass?.enrollments?.map((item) => item.studentId) ?? []);
  const addable = candidates.filter((student) => !enrolledIds.has(student.id));

  async function handleEnroll() {
    if (!selected) return;
    setBusy(true);
    try {
      const response = await enrollStudent(classId, selected);
      setKlass(response.data);
      setSelected("");
      setNotice("Đã thêm học viên vào lớp.");
    } catch (err) {
      setError(formatError(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleUnenroll(studentId: string) {
    setBusy(true);
    try {
      await unenrollStudent(classId, studentId);
      setNotice("Đã gỡ học viên khỏi lớp.");
      await reload();
    } catch (err) {
      setError(formatError(err));
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">Đang tải lớp...</p>;
  }

  if (!klass) {
    return <p className="text-sm text-red-600">{error ?? "Không tìm thấy lớp."}</p>;
  }

  return (
    <div className="space-y-5">
      <Link
        href={`${PAGE_PATHS.admin}/classes`}
        className="inline-flex items-center gap-1 text-sm font-semibold text-primary"
      >
        <ArrowLeft className="size-4" />
        Về danh sách lớp
      </Link>

      <div>
        <h2 className="text-2xl font-black font-[family-name:var(--font-nunito)]">{klass.name}</h2>
        <p className="text-sm text-muted-foreground">
          {klass.teacher?.fullName ?? "Chưa có GV"} · {klass.studentCount}
          {klass.capacity ? `/${klass.capacity}` : ""} HV
          {readOnly ? " · Chỉ xem" : ""}
        </p>
      </div>

      {notice ? (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {notice}
        </p>
      ) : null}
      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      ) : null}

      {!readOnly ? (
        <div className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-4 sm:flex-row">
          <select
            className="h-11 flex-1 rounded-lg border border-border bg-card px-3 text-sm"
            value={selected}
            onChange={(event) => setSelected(event.target.value)}
          >
            <option value="">Chọn học viên để thêm</option>
            {addable.map((student) => (
              <option key={student.id} value={student.id}>
                {student.fullName}
              </option>
            ))}
          </select>
          <Button type="button" disabled={!selected || busy} onClick={() => void handleEnroll()}>
            <UserPlus className="size-4" />
            Thêm vào lớp
          </Button>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        {(klass.enrollments ?? []).length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">Chưa có học viên trong lớp.</p>
        ) : (
          <ul className="divide-y divide-border">
            {(klass.enrollments ?? []).map((enrollment) => (
              <li key={enrollment.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div>
                  <p className="font-semibold">{enrollment.student.fullName}</p>
                  <p className="text-xs text-muted-foreground">{enrollment.student.phone ?? "—"}</p>
                </div>
                {!readOnly ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={busy}
                    onClick={() => void handleUnenroll(enrollment.studentId)}
                  >
                    <UserMinus className="size-4" />
                    Gỡ
                  </Button>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
