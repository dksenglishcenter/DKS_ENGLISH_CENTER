"use client";

import { useEffect, useRef, useState, type ComponentProps, type FormEvent } from "react";
import { Pencil, Plus, RefreshCw, Search, Trash2, X } from "lucide-react";

import { useAdminUser } from "@/components/admin/admin-shell";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { formatAdminDateTime } from "@/lib/admin/format";
import { scrollToElement, scrollToFirstInvalid } from "@/lib/admin/scroll";
import { formatError } from "@/lib/errors/format-error";
import {
  createUser,
  deleteUser,
  listUsers,
  updateUser,
} from "@/lib/users/api";
import type {
  ManagedUser,
  UserPayload,
  UserRole,
  UsersMeta,
} from "@/lib/users/types";

const PAGE_SIZE = 10;
const EMPTY_FORM: UserPayload = {
  fullName: "",
  email: "",
  phone: "",
  password: "",
  role: "USER",
};

const FILTER_CONTROL =
  "h-11 rounded-lg border border-border bg-white px-4 text-sm font-semibold text-[#4A2306] outline-none transition-all focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary";

type TextField = "fullName" | "email" | "phone" | "password" | "role";

export function UsersAdmin() {
  const currentUser = useAdminUser();
  const formRef = useRef<HTMLFormElement>(null);

  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [meta, setMeta] = useState<UsersMeta | null>(null);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"" | UserRole>("");
  const [reloadKey, setReloadKey] = useState(0);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<UserPayload>(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<TextField, string>>>({});
  const [deleteTarget, setDeleteTarget] = useState<ManagedUser | null>(null);

  const editingSelf = editingId === currentUser.id;

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setListError(null);

    listUsers({
      page,
      pageSize: PAGE_SIZE,
      search: search || undefined,
      role: roleFilter || undefined,
      signal: controller.signal,
    })
      .then((response) => {
        setUsers(response.data);
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
  }, [page, reloadKey, roleFilter, search]);

  useEffect(() => {
    if (showForm) scrollToElement(formRef.current);
  }, [showForm, editingId]);

  function reload() {
    setReloadKey((current) => current + 1);
  }

  function resetFormState() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setFieldErrors({});
  }

  function openCreate() {
    resetFormState();
    setNotice(null);
    setShowForm(true);
  }

  function openEdit(user: ManagedUser) {
    setEditingId(user.id);
    setForm({
      fullName: user.fullName,
      email: user.email,
      phone: user.phone ?? "",
      password: "",
      role: user.role,
    });
    setFormError(null);
    setFieldErrors({});
    setNotice(null);
    setShowForm(true);
  }

  function closeForm() {
    if (saving) return;
    setShowForm(false);
    resetFormState();
  }

  function toggleCreateForm() {
    if (showForm && !editingId) {
      closeForm();
      return;
    }
    openCreate();
  }

  function setField<K extends keyof UserPayload>(key: K, value: UserPayload[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    if (key in fieldErrors) {
      setFieldErrors((current) => ({ ...current, [key]: undefined }));
    }
  }

  function validate(): Partial<Record<TextField, string>> {
    const errors: Partial<Record<TextField, string>> = {};
    const fullName = form.fullName.trim();
    const email = form.email.trim();
    const password = form.password?.trim() ?? "";

    if (fullName.length < 2) errors.fullName = "Họ tên cần ít nhất 2 ký tự.";
    if (!email) errors.email = "Email là bắt buộc.";
    if (!editingId && !password) errors.password = "Mật khẩu là bắt buộc khi tạo tài khoản.";
    if (password && password.length < 8) errors.password = "Mật khẩu cần tối thiểu 8 ký tự.";
    return errors;
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setNotice(null);

    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length) {
      setFormError("Vui lòng sửa các ô còn lỗi trước khi lưu.");
      scrollToFirstInvalid(formRef.current);
      return;
    }

    const fullName = form.fullName.trim().replace(/\s+/g, " ");
    const email = form.email.trim().toLowerCase();
    const phone = form.phone?.trim() || null;
    const password = form.password?.trim();

    setSaving(true);
    try {
      const response = editingId
        ? await updateUser(editingId, {
            fullName,
            email,
            phone,
            role: form.role,
            ...(password ? { password } : {}),
          })
        : await createUser({
            fullName,
            email,
            phone,
            role: form.role,
            password: password!,
          });

      setNotice(response.message);
      setShowForm(false);
      resetFormState();
      if (page !== 1) setPage(1);
      else reload();
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
    setListError(null);
    setNotice(null);

    try {
      const response = await deleteUser(deleteTarget.id);
      setNotice(response.message);
      setDeleteTarget(null);
      if (users.length === 1 && page > 1) setPage((current) => current - 1);
      else reload();
    } catch (error) {
      setListError(formatError(error));
    } finally {
      setDeleting(false);
    }
  }

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSearch(searchInput.trim());
    setPage(1);
  }

  function clearSearch() {
    setSearchInput("");
    setSearch("");
    setPage(1);
  }

  const textField = (
    key: Exclude<TextField, "role" | "password">,
    label: string,
    props: ComponentProps<typeof Input> = {},
  ) => (
    <label className="block text-sm" data-invalid={fieldErrors[key] ? "true" : undefined}>
      <span className="mb-1 block font-semibold text-[#4A2306]">{label}</span>
      <Input
        className={`bg-white ${fieldErrors[key] ? "border-red-500" : ""}`}
        value={String(form[key] ?? "")}
        onChange={(event) => setField(key, event.target.value)}
        {...props}
      />
      {fieldErrors[key] ? (
        <p className="mt-1 text-xs text-red-600">{fieldErrors[key]}</p>
      ) : null}
    </label>
  );

  return (
    <section className="space-y-6" aria-labelledby="users-title">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2
            id="users-title"
            className="text-2xl font-black text-[#4A2306] font-[family-name:var(--font-nunito)]"
          >
            Người dùng
          </h2>
          <p className="mt-1 text-sm text-[#9B6B50]">
            Quản lý tài khoản USER và ADMIN của hệ thống.
          </p>
        </div>
        <Button
          type="button"
          variant={showForm && !editingId ? "outline" : "primary"}
          onClick={toggleCreateForm}
        >
          <Plus className="size-4" aria-hidden="true" />
          {showForm && !editingId ? "Đóng form thêm" : "Tạo tài khoản"}
        </Button>
      </div>

      {listError ? <p className="text-sm text-red-600">{listError}</p> : null}
      {notice ? (
        <p role="status" className="rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          {notice}
        </p>
      ) : null}

      {showForm ? (
        <form
          ref={formRef}
          onSubmit={handleSave}
          className="scroll-mt-6 grid gap-4 rounded-2xl border border-border bg-white p-5 md:grid-cols-2"
        >
          <h3 className="md:col-span-2 text-lg font-black text-[#4A2306] font-[family-name:var(--font-nunito)]">
            {editingId ? "Sửa tài khoản" : "Thêm tài khoản"}
          </h3>

          {formError ? (
            <p role="alert" className="md:col-span-2 text-sm text-red-600">
              {formError}
            </p>
          ) : null}

          {textField("fullName", "Họ và tên", { maxLength: 100, required: true })}
          {textField("email", "Email", { type: "email", maxLength: 255, required: true })}
          {textField("phone", "Số điện thoại", { maxLength: 20 })}

          <label className="block text-sm" data-invalid={fieldErrors.role ? "true" : undefined}>
            <span className="mb-1 block font-semibold text-[#4A2306]">Quyền</span>
            <select
              className={`h-12 w-full ${FILTER_CONTROL}`}
              value={form.role}
              disabled={editingSelf}
              onChange={(event) => setField("role", event.target.value as UserRole)}
            >
              <option value="USER">USER</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </label>

          <label
            className="block text-sm md:col-span-2"
            data-invalid={fieldErrors.password ? "true" : undefined}
          >
            <span className="mb-1 block font-semibold text-[#4A2306]">
              {editingId ? "Mật khẩu mới (để trống nếu không đổi)" : "Mật khẩu"}
            </span>
            <PasswordInput
              className={`bg-white ${fieldErrors.password ? "border-red-500" : ""}`}
              value={form.password ?? ""}
              minLength={8}
              maxLength={72}
              required={!editingId}
              autoComplete="new-password"
              onChange={(event) => setField("password", event.target.value)}
            />
            {fieldErrors.password ? (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.password}</p>
            ) : null}
          </label>

          <div className="flex justify-end gap-2 md:col-span-2">
            <Button type="button" variant="outline" disabled={saving} onClick={closeForm}>
              Hủy
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Đang lưu..." : "Lưu tài khoản"}
            </Button>
          </div>
        </form>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-border bg-white">
        <div className="flex flex-col gap-3 border-b border-border p-4 lg:flex-row lg:items-center">
          <form className="flex flex-1 gap-2" role="search" onSubmit={submitSearch}>
            <Input
              type="search"
              className="h-11 py-2"
              value={searchInput}
              maxLength={100}
              placeholder="Tìm tên, email, số điện thoại..."
              onChange={(event) => setSearchInput(event.target.value)}
            />
            {searchInput || search ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-11"
                aria-label="Xóa tìm kiếm"
                onClick={clearSearch}
              >
                <X className="size-4" aria-hidden="true" />
              </Button>
            ) : null}
            <Button type="submit" size="sm" className="h-11 px-5">
              <Search className="size-4" aria-hidden="true" />
              Tìm
            </Button>
          </form>

          <select
            aria-label="Lọc theo quyền"
            className={FILTER_CONTROL}
            value={roleFilter}
            onChange={(event) => {
              setRoleFilter(event.target.value as "" | UserRole);
              setPage(1);
            }}
          >
            <option value="">Tất cả quyền</option>
            <option value="USER">USER</option>
            <option value="ADMIN">ADMIN</option>
          </select>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-11"
            disabled={loading}
            onClick={reload}
          >
            <RefreshCw className="size-4" aria-hidden="true" />
            Tải lại
          </Button>
        </div>

        {loading ? (
          <p className="p-8 text-center text-sm text-[#9B6B50]">Đang tải...</p>
        ) : users.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">
            Không tìm thấy tài khoản phù hợp.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-border bg-[#FFF9F5] text-[#9B6B50]">
                <tr>
                  <th className="px-4 py-3 font-semibold">Người dùng</th>
                  <th className="px-4 py-3 font-semibold">Điện thoại</th>
                  <th className="px-4 py-3 font-semibold">Quyền</th>
                  <th className="px-4 py-3 font-semibold">Ngày tạo</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const isSelf = user.id === currentUser.id;
                  return (
                    <tr key={user.id} className="border-b border-border last:border-0">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-[#4A2306]">
                          {user.fullName}
                          {isSelf ? " (Bạn)" : ""}
                        </div>
                        <div className="text-xs text-[#9B6B50]">{user.email}</div>
                      </td>
                      <td className="px-4 py-3 text-[#6B3E26]">{user.phone || "—"}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-bold text-primary">
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {formatAdminDateTime(user.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="min-w-[76px]"
                            onClick={() => openEdit(user)}
                          >
                            <Pencil className="size-4" aria-hidden="true" />
                            Sửa
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            className="min-w-[76px]"
                            disabled={isSelf}
                            title={isSelf ? "Không thể tự xóa tài khoản" : undefined}
                            onClick={() => setDeleteTarget(user)}
                          >
                            <Trash2 className="size-4" aria-hidden="true" />
                            Xóa
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {meta && meta.totalPages > 1 ? (
          <div className="flex items-center justify-center gap-3 border-t border-border p-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={loading || page <= 1}
              onClick={() => setPage((current) => current - 1)}
            >
              Trang trước
            </Button>
            <span className="text-sm text-muted-foreground">
              Trang {meta.currentPage}/{meta.totalPages}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={loading || page >= meta.totalPages}
              onClick={() => setPage((current) => current + 1)}
            >
              Trang sau
            </Button>
          </div>
        ) : null}
      </div>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Xóa tài khoản?"
        description={
          deleteTarget
            ? `Tài khoản ${deleteTarget.fullName} (${deleteTarget.email}) sẽ bị xóa vĩnh viễn.`
            : ""
        }
        busy={deleting}
        onCancel={() => {
          if (!deleting) setDeleteTarget(null);
        }}
        onConfirm={() => void handleDelete()}
      />
    </section>
  );
}
