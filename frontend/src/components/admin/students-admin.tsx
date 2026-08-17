"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Pencil, Plus, RefreshCw, Search, Trash2, X } from "lucide-react";

import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { scrollToFirstInvalid } from "@/lib/admin/scroll";
import { formatError } from "@/lib/errors/format-error";
import { PAGE_PATHS } from "@/lib/navigation-paths";
import {
  createStudent,
  deleteStudent,
  listStudents,
  updateStudent,
} from "@/lib/ops/api";
import type { ListMeta, Student, StudentStatus } from "@/lib/ops/types";
import { validateStudentForm } from "@/lib/ops/validate";
import { listUsers } from "@/lib/users/api";
import type { ManagedUser } from "@/lib/users/types";
import { sanitizePhoneInput } from "@/lib/validation/phone";

const PAGE_SIZE = 20;
const FILTER_CONTROL =
  "h-11 rounded-lg border border-border bg-card px-4 text-sm font-semibold text-foreground outline-none transition-all focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary";

const STATUS_LABEL: Record<StudentStatus, string> = {
  STUDYING: "Đang học",
  PAUSED: "Bảo lưu",
  FINISHED: "Kết thúc",
};

type FormState = {
  fullName: string;
  phone: string;
  email: string;
  status: StudentStatus;
  parentUserId: string;
};

const EMPTY_FORM: FormState = {
  fullName: "",
  phone: "",
  email: "",
  status: "STUDYING",
  parentUserId: "",
};

export function StudentsAdmin() {
  const formRef = useRef<HTMLFormElement>(null);
  const [items, setItems] = useState<Student[]>([]);
  const [meta, setMeta] = useState<ListMeta | null>(null);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | StudentStatus>("");
  const [reloadKey, setReloadKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Student | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<"fullName" | "phone" | "email", string>>
  >({});
  const [deleteTarget, setDeleteTarget] = useState<Student | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [parents, setParents] = useState<ManagedUser[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setListError(null);
    listStudents({
      page,
      pageSize: PAGE_SIZE,
      search: search || undefined,
      status: statusFilter,
      signal: controller.signal,
    })
      .then((response) => {
        setItems(response.data);
        setMeta(response.meta);
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setListError(formatError(error));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [page, search, statusFilter, reloadKey]);

  useEffect(() => {
    listUsers({ role: "PARENT", pageSize: 100 })
      .then((response) => setParents(response.data))
      .catch(() => setParents([]));
  }, [reloadKey]);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setFieldErrors({});
    setFormOpen(true);
  }

  function openEdit(student: Student) {
    setEditing(student);
    setForm({
      fullName: student.fullName,
      phone: student.phone ?? "",
      email: student.email ?? "",
      status: student.status,
      parentUserId: student.parents?.[0]?.parentUserId ?? "",
    });
    setFormError(null);
    setFieldErrors({});
    setFormOpen(true);
  }

  async function handleSave(event: FormEvent) {
    event.preventDefault();
    const errors = validateStudentForm(form);
    setFieldErrors(errors);
    if (Object.keys(errors).length) {
      setFormError("Vui lòng sửa các ô còn lỗi trước khi lưu.");
      scrollToFirstInvalid(formRef.current);
      return;
    }
    setSaving(true);
    setFormError(null);
    const parent = parents.find((item) => item.id === form.parentUserId);
    const payload = {
      fullName: form.fullName.trim(),
      phone: form.phone.trim() || null,
      email: form.email.trim() || null,
      parentName: parent?.fullName ?? null,
      parentPhone: parent?.phone ?? null,
      status: form.status,
      parentUserIds: form.parentUserId ? [form.parentUserId] : [],
    };
    try {
      const response = editing
        ? await updateStudent(editing.id, payload)
        : await createStudent(payload);
      setNotice(response.message);
      setFormOpen(false);
      setReloadKey((value) => value + 1);
    } catch (error) {
      setFormError(formatError(error));
      scrollToFirstInvalid(formRef.current);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const response = await deleteStudent(deleteTarget.id);
      setNotice(response.message);
      setDeleteTarget(null);
      setReloadKey((value) => value + 1);
    } catch (error) {
      setListError(formatError(error));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-black text-foreground font-[family-name:var(--font-nunito)]">
            Học viên
          </h2>
          <p className="text-sm text-muted-foreground">Quản lý hồ sơ và trạng thái học.</p>
        </div>
        <Button type="button" onClick={openCreate}>
          <Plus className="size-4" />
          Thêm học viên
        </Button>
      </div>

      {notice ? (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {notice}
        </p>
      ) : null}
      {listError ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {listError}
        </p>
      ) : null}

      <form
        className="flex flex-col gap-2 sm:flex-row"
        onSubmit={(event) => {
          event.preventDefault();
          setPage(1);
          setSearch(searchInput.trim());
        }}
      >
        <div className="relative flex-1">
          <Input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Tìm tên, SĐT, email..."
            className="h-11 bg-card pr-10"
          />
          {searchInput ? (
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              onClick={() => {
                setSearchInput("");
                setSearch("");
                setPage(1);
              }}
            >
              <X className="size-4" />
            </button>
          ) : null}
        </div>
        <select
          className={FILTER_CONTROL}
          value={statusFilter}
          onChange={(event) => {
            setStatusFilter(event.target.value as "" | StudentStatus);
            setPage(1);
          }}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="STUDYING">Đang học</option>
          <option value="PAUSED">Bảo lưu</option>
          <option value="FINISHED">Kết thúc</option>
        </select>
        <Button type="submit" size="sm" className="h-11">
          <Search className="size-4" />
          Tìm
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-11"
          onClick={() => setReloadKey((value) => value + 1)}
        >
          <RefreshCw className="size-4" />
        </Button>
      </form>

      {formOpen ? (
        <form
          ref={formRef}
          noValidate
          onSubmit={handleSave}
          className="grid gap-4 rounded-2xl border border-border bg-card p-5 md:grid-cols-2"
        >
          <h3 className="text-lg font-black md:col-span-2 font-[family-name:var(--font-nunito)]">
            {editing ? "Sửa học viên" : "Thêm học viên"}
          </h3>
          {formError ? (
            <p role="alert" className="text-sm text-red-600 md:col-span-2">
              {formError}
            </p>
          ) : null}
          <label className="text-sm" data-invalid={fieldErrors.fullName ? "true" : undefined}>
            <span className="mb-1 block font-semibold">Họ tên *</span>
            <Input
              maxLength={100}
              className={fieldErrors.fullName ? "border-red-500" : ""}
              value={form.fullName}
              onChange={(event) => {
                setForm({ ...form, fullName: event.target.value });
                setFieldErrors((current) => ({ ...current, fullName: undefined }));
              }}
            />
            {fieldErrors.fullName ? (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.fullName}</p>
            ) : null}
          </label>
          <label className="text-sm" data-invalid={fieldErrors.phone ? "true" : undefined}>
            <span className="mb-1 block font-semibold">Số điện thoại</span>
            <Input
              inputMode="tel"
              maxLength={20}
              className={fieldErrors.phone ? "border-red-500" : ""}
              value={form.phone}
              onChange={(event) => {
                setForm({ ...form, phone: sanitizePhoneInput(event.target.value) });
                setFieldErrors((current) => ({ ...current, phone: undefined }));
              }}
            />
            {fieldErrors.phone ? (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.phone}</p>
            ) : null}
          </label>
          <label className="text-sm" data-invalid={fieldErrors.email ? "true" : undefined}>
            <span className="mb-1 block font-semibold">Email</span>
            <Input
              type="email"
              maxLength={255}
              className={fieldErrors.email ? "border-red-500" : ""}
              value={form.email}
              onChange={(event) => {
                setForm({ ...form, email: event.target.value });
                setFieldErrors((current) => ({ ...current, email: undefined }));
              }}
            />
            {fieldErrors.email ? (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>
            ) : null}
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-semibold">Trạng thái</span>
            <select
              className={`h-12 w-full ${FILTER_CONTROL}`}
              value={form.status}
              onChange={(event) =>
                setForm({ ...form, status: event.target.value as StudentStatus })
              }
            >
              <option value="STUDYING">Đang học</option>
              <option value="PAUSED">Bảo lưu</option>
              <option value="FINISHED">Kết thúc</option>
            </select>
          </label>
          <label className="text-sm md:col-span-2">
            <span className="mb-1 block font-semibold">Tài khoản phụ huynh</span>
            <select
              className={`h-12 w-full ${FILTER_CONTROL}`}
              value={form.parentUserId}
              onChange={(event) => setForm({ ...form, parentUserId: event.target.value })}
            >
              <option value="">Chưa gắn phụ huynh</option>
              {parents.map((parent) => (
                <option key={parent.id} value={parent.id}>
                  {parent.fullName} · {parent.email}
                </option>
              ))}
            </select>
            {parents.length === 0 ? (
              <p className="mt-1 text-xs text-muted-foreground">
                Chưa có tài khoản PARENT. Tạo trong{" "}
                <a href={`${PAGE_PATHS.admin}/users`} className="font-semibold text-primary hover:underline">
                  Người dùng
                </a>
                .
              </p>
            ) : null}
          </label>
          <div className="flex justify-end gap-2 md:col-span-2">
            <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
              Hủy
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Đang lưu..." : "Lưu"}
            </Button>
          </div>
        </form>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        {loading ? (
          <p className="p-8 text-center text-sm text-muted-foreground">Đang tải...</p>
        ) : items.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">Không có học viên.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-secondary/50 text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-semibold">Họ tên</th>
                  <th className="px-4 py-3 font-semibold">SĐT</th>
                  <th className="px-4 py-3 font-semibold">Phụ huynh</th>
                  <th className="px-4 py-3 font-semibold">Trạng thái</th>
                  <th className="px-4 py-3 font-semibold" />
                </tr>
              </thead>
              <tbody>
                {items.map((student) => (
                  <tr key={student.id} className="border-t border-border">
                    <td className="px-4 py-3 font-semibold">{student.fullName}</td>
                    <td className="px-4 py-3">{student.phone ?? "—"}</td>
                    <td className="px-4 py-3">
                      {student.parents?.[0]
                        ? `${student.parents[0].parent.fullName} · ${student.parents[0].parent.email}`
                        : student.parentName || "—"}
                    </td>
                    <td className="px-4 py-3">{STATUS_LABEL[student.status]}</td>
                    <td className="px-4 py-3 text-right">
                      <Button type="button" variant="ghost" size="sm" onClick={() => openEdit(student)}>
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteTarget(student)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {meta && meta.totalPages > 1 ? (
        <div className="flex items-center justify-between text-sm">
          <span>
            Trang {meta.currentPage}/{meta.totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((value) => value - 1)}
            >
              Trước
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page >= meta.totalPages}
              onClick={() => setPage((value) => value + 1)}
            >
              Sau
            </Button>
          </div>
        </div>
      ) : null}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Kết thúc học viên?"
        description="Học viên sẽ chuyển sang trạng thái Kết thúc, lịch sử điểm danh được giữ lại."
        confirmLabel="Kết thúc"
        busy={deleting}
        onConfirm={() => void handleDelete()}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
