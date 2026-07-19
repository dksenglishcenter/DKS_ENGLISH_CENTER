"use client";

import { useRef, useState, type ComponentProps, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { scrollToFirstInvalid } from "@/lib/admin/scroll";
import { formatError } from "@/lib/errors/format-error";
import { createUser, updateUser } from "@/lib/users/api";
import type { ManagedUser, UserPayload, UserRole } from "@/lib/users/types";

const EMPTY_FORM: UserPayload = {
  fullName: "",
  email: "",
  phone: "",
  password: "",
  role: "USER",
};

const FILTER_CONTROL =
  "h-11 rounded-lg border border-border bg-card px-4 text-sm font-semibold text-foreground outline-none transition-all focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary";

type TextField = "fullName" | "email" | "phone" | "password" | "role";

type UsersFormProps = {
  user: ManagedUser | null;
  currentUserId: string;
  onCancel: () => void;
  onSaved: (message: string) => void;
};

export function UsersForm({
  user,
  currentUserId,
  onCancel,
  onSaved,
}: UsersFormProps) {
  const editingId = user?.id ?? null;
  const editingSelf = editingId === currentUserId;
  const formRef = useRef<HTMLFormElement>(null);

  const [form, setForm] = useState<UserPayload>(() =>
    user
      ? {
          fullName: user.fullName,
          email: user.email,
          phone: user.phone ?? "",
          password: "",
          role: user.role,
        }
      : EMPTY_FORM,
  );
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<TextField, string>>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

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

  function handleCancel() {
    if (saving) return;
    onCancel();
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

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

      onSaved(response.message);
    } catch (error) {
      setFormError(formatError(error));
      scrollToFirstInvalid(formRef.current);
    } finally {
      setSaving(false);
    }
  }

  const textField = (
    key: Exclude<TextField, "role" | "password">,
    label: string,
    props: ComponentProps<typeof Input> = {},
  ) => (
    <label className="block text-sm" data-invalid={fieldErrors[key] ? "true" : undefined}>
      <span className="mb-1 block font-semibold text-foreground">{label}</span>
      <Input
        className={`bg-card ${fieldErrors[key] ? "border-red-500" : ""}`}
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
    <form
      ref={formRef}
      onSubmit={handleSave}
      className="scroll-mt-6 grid gap-4 rounded-2xl border border-border bg-card p-5 md:grid-cols-2"
    >
      <h3 className="md:col-span-2 text-lg font-black text-foreground font-[family-name:var(--font-nunito)]">
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
        <span className="mb-1 block font-semibold text-foreground">Quyền</span>
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
        <span className="mb-1 block font-semibold text-foreground">
          {editingId ? "Mật khẩu mới (để trống nếu không đổi)" : "Mật khẩu"}
        </span>
        <PasswordInput
          className={`bg-card ${fieldErrors.password ? "border-red-500" : ""}`}
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
        <Button type="button" variant="outline" disabled={saving} onClick={handleCancel}>
          Hủy
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? "Đang lưu..." : "Lưu tài khoản"}
        </Button>
      </div>
    </form>
  );
}
