"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { Pencil, Plus, RefreshCw, Search, Trash2 } from "lucide-react";

import { useAdminUser } from "@/components/admin/admin-shell";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { listCourses } from "@/lib/courses/api";
import { formatError } from "@/lib/errors/format-error";
import { PAGE_PATHS } from "@/lib/navigation-paths";
import { createClass, deleteClass, listClasses, listMyClasses, updateClass } from "@/lib/ops/api";
import type { ClassGroup, ClassPayload, ClassStatus, ListMeta } from "@/lib/ops/types";
import { listUsers } from "@/lib/users/api";
import type { ManagedUser } from "@/lib/users/types";

const FILTER_CONTROL =
  "h-11 rounded-lg border border-border bg-card px-4 text-sm font-semibold text-foreground outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary";

const DAYS = [
  { value: 1, label: "T2" },
  { value: 2, label: "T3" },
  { value: 3, label: "T4" },
  { value: 4, label: "T5" },
  { value: 5, label: "T6" },
  { value: 6, label: "T7" },
  { value: 0, label: "CN" },
];

const EMPTY: ClassPayload = {
  name: "",
  courseId: null,
  teacherId: null,
  scheduleDays: [],
  startTime: "18:00",
  endTime: "19:30",
  capacity: 12,
  status: "OPEN",
};

function formatDays(days: number[]) {
  if (!days.length) return "—";
  return DAYS.filter((day) => days.includes(day.value))
    .map((day) => day.label)
    .join(", ");
}

export function ClassesAdmin() {
  const user = useAdminUser();
  const isTeacher = user.role === "TEACHER";
  const [items, setItems] = useState<ClassGroup[]>([]);
  const [meta, setMeta] = useState<ListMeta | null>(null);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ClassGroup | null>(null);
  const [form, setForm] = useState<ClassPayload>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ClassGroup | null>(null);
  const [teachers, setTeachers] = useState<ManagedUser[]>([]);
  const [courses, setCourses] = useState<Array<{ id: string; title: string }>>([]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    const request = isTeacher
      ? listMyClasses(controller.signal).then((response) => {
          setItems(response.data);
          setMeta(null);
        })
      : listClasses({
          page,
          search: search || undefined,
          signal: controller.signal,
        }).then((response) => {
          setItems(response.data);
          setMeta(response.meta);
        });

    request
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(formatError(err));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [isTeacher, page, search, reloadKey]);

  useEffect(() => {
    if (isTeacher) return;
    listUsers({ role: "TEACHER", pageSize: 100 })
      .then((response) => setTeachers(response.data))
      .catch(() => setTeachers([]));
    listCourses({ publishedOnly: false })
      .then((response) => setCourses(response.courses.map((c) => ({ id: c.id, title: c.title }))))
      .catch(() => setCourses([]));
  }, [isTeacher]);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY);
    setFormError(null);
    setFormOpen(true);
  }

  function openEdit(item: ClassGroup) {
    setEditing(item);
    setForm({
      name: item.name,
      courseId: item.courseId,
      teacherId: item.teacherId,
      scheduleDays: item.scheduleDays,
      startTime: item.startTime,
      endTime: item.endTime,
      room: item.room,
      capacity: item.capacity,
      status: item.status,
    });
    setFormError(null);
    setFormOpen(true);
  }

  async function handleSave(event: FormEvent) {
    event.preventDefault();
    if (!form.name.trim()) {
      setFormError("Tên lớp không được để trống.");
      return;
    }
    setSaving(true);
    setFormError(null);
    const payload: ClassPayload = {
      ...form,
      name: form.name.trim(),
      courseId: form.courseId || null,
      teacherId: form.teacherId || null,
      capacity: form.capacity ? Number(form.capacity) : null,
    };
    try {
      const response = editing
        ? await updateClass(editing.id, payload)
        : await createClass(payload);
      setNotice(response.message);
      setFormOpen(false);
      setReloadKey((value) => value + 1);
    } catch (err) {
      setFormError(formatError(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-black font-[family-name:var(--font-nunito)]">
            {isTeacher ? "Lớp của tôi" : "Lớp học"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {isTeacher ? "Xem lớp được phân công." : "Tạo lớp, gán giáo viên và sĩ số."}
          </p>
        </div>
        {!isTeacher ? (
          <Button type="button" onClick={openCreate}>
            <Plus className="size-4" />
            Thêm lớp
          </Button>
        ) : null}
      </div>

      {notice ? (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {notice}
        </p>
      ) : null}
      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      ) : null}

      {!isTeacher ? (
        <form
          className="flex gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            setPage(1);
            setSearch(searchInput.trim());
          }}
        >
          <Input
            className="h-11 bg-card"
            value={searchInput}
            placeholder="Tìm lớp, giáo viên..."
            onChange={(event) => setSearchInput(event.target.value)}
          />
          <Button type="submit" className="h-11">
            <Search className="size-4" />
          </Button>
          <Button type="button" variant="outline" className="h-11" onClick={() => setReloadKey((v) => v + 1)}>
            <RefreshCw className="size-4" />
          </Button>
        </form>
      ) : null}

      {formOpen && !isTeacher ? (
        <form
          onSubmit={handleSave}
          className="grid gap-4 rounded-2xl border border-border bg-card p-5 md:grid-cols-2"
        >
          <h3 className="text-lg font-black md:col-span-2 font-[family-name:var(--font-nunito)]">
            {editing ? "Sửa lớp" : "Thêm lớp"}
          </h3>
          {formError ? <p className="text-sm text-red-600 md:col-span-2">{formError}</p> : null}
          <label className="text-sm md:col-span-2">
            <span className="mb-1 block font-semibold">Tên lớp</span>
            <Input
              required
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-semibold">Khóa học (tuỳ chọn)</span>
            <select
              className={`h-12 w-full ${FILTER_CONTROL}`}
              value={form.courseId ?? ""}
              onChange={(event) => setForm({ ...form, courseId: event.target.value || null })}
            >
              <option value="">Không gắn khóa</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-semibold">Giáo viên</span>
            <select
              className={`h-12 w-full ${FILTER_CONTROL}`}
              value={form.teacherId ?? ""}
              onChange={(event) => setForm({ ...form, teacherId: event.target.value || null })}
            >
              <option value="">Chưa gán</option>
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.fullName}
                </option>
              ))}
            </select>
          </label>
          <fieldset className="text-sm md:col-span-2">
            <legend className="mb-2 font-semibold">Thứ</legend>
            <div className="flex flex-wrap gap-2">
              {DAYS.map((day) => {
                const checked = form.scheduleDays?.includes(day.value) ?? false;
                return (
                  <label key={day.value} className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(event) => {
                        const next = new Set(form.scheduleDays ?? []);
                        if (event.target.checked) next.add(day.value);
                        else next.delete(day.value);
                        setForm({ ...form, scheduleDays: [...next] });
                      }}
                    />
                    {day.label}
                  </label>
                );
              })}
            </div>
          </fieldset>
          <label className="text-sm">
            <span className="mb-1 block font-semibold">Giờ bắt đầu</span>
            <Input
              type="time"
              value={form.startTime ?? ""}
              onChange={(event) => setForm({ ...form, startTime: event.target.value || null })}
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-semibold">Giờ kết thúc</span>
            <Input
              type="time"
              value={form.endTime ?? ""}
              onChange={(event) => setForm({ ...form, endTime: event.target.value || null })}
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-semibold">Sĩ số</span>
            <Input
              type="number"
              min={1}
              value={form.capacity ?? ""}
              onChange={(event) =>
                setForm({ ...form, capacity: event.target.value ? Number(event.target.value) : null })
              }
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-semibold">Trạng thái</span>
            <select
              className={`h-12 w-full ${FILTER_CONTROL}`}
              value={form.status ?? "OPEN"}
              onChange={(event) => setForm({ ...form, status: event.target.value as ClassStatus })}
            >
              <option value="OPEN">Đang mở</option>
              <option value="CLOSED">Đóng</option>
            </select>
          </label>
          <div className="flex justify-end gap-2 md:col-span-2">
            <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
              Hủy
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Đang lưu..." : "Lưu lớp"}
            </Button>
          </div>
        </form>
      ) : null}

      <div className="grid gap-3">
        {loading ? (
          <p className="text-sm text-muted-foreground">Đang tải...</p>
        ) : items.length === 0 ? (
          <p className="rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
            {isTeacher ? "Bạn chưa được gán lớp nào." : "Chưa có lớp."}
          </p>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <Link
                  href={`${PAGE_PATHS.admin}/classes/${item.id}`}
                  className="font-bold text-foreground hover:text-primary"
                >
                  {item.name}
                </Link>
                <p className="text-sm text-muted-foreground">
                  {item.teacher?.fullName ?? "Chưa có GV"} · {formatDays(item.scheduleDays)} ·{" "}
                  {item.startTime ?? "—"} · {item.studentCount}
                  {item.capacity ? `/${item.capacity}` : ""} HV
                </p>
              </div>
              {!isTeacher ? (
                <div className="flex gap-1">
                  <Button type="button" variant="ghost" size="sm" onClick={() => openEdit(item)}>
                    <Pencil className="size-4" />
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setDeleteTarget(item)}>
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ) : null}
            </div>
          ))
        )}
      </div>

      {meta && meta.totalPages > 1 ? (
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((v) => v - 1)}>
            Trước
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= meta.totalPages}
            onClick={() => setPage((v) => v + 1)}
          >
            Sau
          </Button>
        </div>
      ) : null}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Xóa lớp?"
        description="Xóa lớp sẽ xóa cả điểm danh của lớp này."
        busy={false}
        onConfirm={() => {
          if (!deleteTarget) return;
          void deleteClass(deleteTarget.id)
            .then((response) => {
              setNotice(response.message);
              setDeleteTarget(null);
              setReloadKey((v) => v + 1);
            })
            .catch((err) => setError(formatError(err)));
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
