"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

import { AdminImageField } from "@/components/admin/admin-image-field";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Button } from "@/components/ui/button";
import { RowActions } from "./row-actions";
import { useCloudinaryImageReplace } from "@/hooks/use-cloudinary-image-replace";
import { scrollToElement, scrollToFirstInvalid } from "@/lib/admin/scroll";
import { nextSortOrder } from "@/lib/admin/sort-order";
import { formatError } from "@/lib/errors/format-error";
import { isHttpUrl } from "@/lib/media/is-http-url";
import {
  createTeacher,
  deleteTeacher,
  listTeachers,
  updateTeacher,
} from "@/lib/teachers/api";
import type { Teacher, TeacherPayload } from "@/lib/teachers/types";

const EMPTY_FORM: TeacherPayload = {
  name: "",
  title: "",
  cred: "",
  exp: "",
  imageUrl: "",
  bio: "",
  sortOrder: 0,
  isPublished: true,
};

type FieldKey = "name" | "title" | "cred" | "exp" | "bio" | "imageUrl";
type FieldErrors = Partial<Record<FieldKey, string>>;

export function TeachersAdmin() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<TeacherPayload>(EMPTY_FORM);
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Teacher | null>(null);
  const [deleting, setDeleting] = useState(false);

  const formRef = useRef<HTMLDivElement>(null);
  const editingIdRef = useRef<string | null>(null);
  editingIdRef.current = editingId;

  const photo = useCloudinaryImageReplace({
    category: "about-teacher",
    onLivePersist: async (url) => {
      const id = editingIdRef.current;
      if (id) await updateTeacher(id, { imageUrl: url });
    },
    onLiveRestore: async (url) => {
      const id = editingIdRef.current;
      if (id) await updateTeacher(id, { imageUrl: url });
    },
  });

  const load = async () => {
    setLoading(true);
    setListError(null);
    try {
      const response = await listTeachers({ publishedOnly: false });
      setTeachers(response.teachers);
    } catch (err) {
      setListError(formatError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  useEffect(() => {
    if (showForm) scrollToElement(formRef.current);
  }, [showForm, editingId]);

  const closeForm = async () => {
    await photo.discard();
    setShowForm(false);
    setEditingId(null);
    setFormError(null);
    setFieldErrors({});
    photo.reset(null);
    setForm(EMPTY_FORM);
    await load();
  };

  const openCreate = async () => {
    await photo.discard();
    const nextOrder = nextSortOrder(teachers);
    setEditingId(null);
    setFormError(null);
    setFieldErrors({});
    photo.reset(null);
    setForm({ ...EMPTY_FORM, sortOrder: nextOrder });
    setShowForm(true);
  };

  const toggleCreateForm = async () => {
    if (showForm && !editingId) {
      await closeForm();
      return;
    }
    await openCreate();
  };

  const openEdit = async (teacher: Teacher) => {
    await photo.discard();
    setEditingId(teacher.id);
    setFormError(null);
    setFieldErrors({});
    photo.reset(teacher.imageUrl);
    setForm({
      name: teacher.name,
      title: teacher.title,
      cred: teacher.cred,
      exp: teacher.exp,
      imageUrl: teacher.imageUrl,
      bio: teacher.bio,
      sortOrder: teacher.sortOrder,
      isPublished: teacher.isPublished,
    });
    setShowForm(true);
  };

  const handleUpload = async (file: File | null) => {
    setFormError(null);
    setFieldErrors((prev) => ({ ...prev, imageUrl: undefined }));
    try {
      const url = await photo.upload(file);
      if (url) setForm((prev) => ({ ...prev, imageUrl: url }));
    } catch (err) {
      setFormError(formatError(err));
      scrollToFirstInvalid(formRef.current);
    }
  };

  const validate = (): FieldErrors => {
    const errors: FieldErrors = {};
    if (form.name.trim().length < 2) errors.name = "Tên cần tối thiểu 2 ký tự";
    if (form.title.trim().length < 2) errors.title = "Chức danh cần tối thiểu 2 ký tự";
    if (form.cred.trim().length < 2) errors.cred = "Bằng cấp cần tối thiểu 2 ký tự";
    if (form.exp.trim().length < 2) errors.exp = "Kinh nghiệm cần tối thiểu 2 ký tự";
    if (form.bio.trim().length < 10) errors.bio = "Bio cần tối thiểu 10 ký tự";
    if (!isHttpUrl(form.imageUrl)) errors.imageUrl = "Chưa có ảnh — vui lòng chọn ảnh rồi lưu";
    return errors;
  };

  const handleSave = async () => {
    setFormError(null);
    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length) {
      setFormError("Vui lòng sửa các ô còn lỗi trước khi lưu.");
      scrollToFirstInvalid(formRef.current);
      return;
    }

    setSaving(true);
    try {
      const payload: TeacherPayload = {
        ...form,
        name: form.name.trim(),
        title: form.title.trim(),
        cred: form.cred.trim(),
        exp: form.exp.trim(),
        bio: form.bio.trim(),
        imageUrl: form.imageUrl.trim(),
      };
      if (editingId) await updateTeacher(editingId, payload);
      else await createTeacher(payload);

      await photo.commit(payload.imageUrl);
      setShowForm(false);
      setEditingId(null);
      setForm(EMPTY_FORM);
      await load();
    } catch (err) {
      setFormError(formatError(err));
      scrollToFirstInvalid(formRef.current);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setListError(null);
    try {
      await deleteTeacher(deleteTarget.id);
      if (editingId === deleteTarget.id) await closeForm();
      setDeleteTarget(null);
      await load();
    } catch (err) {
      setListError(formatError(err));
    } finally {
      setDeleting(false);
    }
  };

  const field = (key: FieldKey, label: string, multiline = false) => (
    <label className="block text-sm" data-invalid={fieldErrors[key] ? "true" : undefined}>
      <span className="mb-1 block font-semibold text-[#4A2306]">{label}</span>
      {multiline ? (
        <textarea
          className={`min-h-28 w-full rounded-lg border px-3 py-2 ${
            fieldErrors[key] ? "border-red-500" : "border-border"
          }`}
          value={form[key]}
          onChange={(event) => {
            setForm((prev) => ({ ...prev, [key]: event.target.value }));
            setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
          }}
        />
      ) : (
        <input
          className={`w-full rounded-lg border px-3 py-2 ${
            fieldErrors[key] ? "border-red-500" : "border-border"
          }`}
          value={form[key]}
          onChange={(event) => {
            setForm((prev) => ({ ...prev, [key]: event.target.value }));
            setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
          }}
        />
      )}
      {fieldErrors[key] ? (
        <p className="mt-1 text-xs text-red-600">{fieldErrors[key]}</p>
      ) : null}
    </label>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-black text-[#4A2306] font-[family-name:var(--font-nunito)]">
          Giáo viên
        </h2>
        <Button
          type="button"
          variant={showForm && !editingId ? "outline" : "primary"}
          onClick={() => void toggleCreateForm()}
        >
          {showForm && !editingId ? "Đóng form thêm" : "Thêm giáo viên"}
        </Button>
      </div>

      {listError ? <p className="text-sm text-red-600">{listError}</p> : null}
      {loading ? <p className="text-sm text-[#9B6B50]">Đang tải...</p> : null}

      <div className="overflow-x-auto rounded-2xl border border-border bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-border bg-[#FFF9F5] text-[#9B6B50]">
            <tr>
              <th className="px-4 py-3 font-semibold">Ảnh</th>
              <th className="px-4 py-3 font-semibold">Tên</th>
              <th className="px-4 py-3 font-semibold">Chức danh</th>
              <th className="px-4 py-3 font-semibold">Order</th>
              <th className="px-4 py-3 font-semibold">Published</th>
              <th className="px-4 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {teachers.map((teacher) => (
              <tr key={teacher.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3">
                  <div className="relative h-14 w-14 overflow-hidden rounded-full border border-border bg-[#FFF9F5]">
                    {teacher.imageUrl ? (
                      <Image
                        src={teacher.imageUrl}
                        alt={teacher.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : null}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="font-semibold text-[#4A2306]">{teacher.name}</div>
                  <div className="text-xs text-[#9B6B50]">{teacher.cred}</div>
                </td>
                <td className="px-4 py-3">{teacher.title}</td>
                <td className="px-4 py-3">{teacher.sortOrder}</td>
                <td className="px-4 py-3">{teacher.isPublished ? "Có" : "Ẩn"}</td>
                <td className="px-4 py-3">
                  <RowActions
                    onEdit={() => void openEdit(teacher)}
                    onDelete={() => setDeleteTarget(teacher)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm ? (
        <div
          ref={formRef}
          className="scroll-mt-6 space-y-4 rounded-2xl border border-border bg-white p-5"
        >
          <h3 className="text-lg font-black text-[#4A2306] font-[family-name:var(--font-nunito)]">
            {editingId ? "Sửa giáo viên" : "Thêm giáo viên"}
          </h3>
          {formError ? <p className="text-sm text-red-600">{formError}</p> : null}

          <div className="grid gap-4 md:grid-cols-2">
            {field("name", "Tên")}
            {field("title", "Chức danh")}
            {field("cred", "Bằng cấp / chứng chỉ")}
            {field("exp", "Kinh nghiệm")}
            <label className="block text-sm">
              <span className="mb-1 block font-semibold text-[#4A2306]">Thứ tự hiển thị</span>
              <input
                type="number"
                min={0}
                className="w-full rounded-lg border border-border px-3 py-2"
                value={form.sortOrder}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, sortOrder: Number(event.target.value) }))
                }
              />
              <span className="mt-1 block text-xs text-[#9B6B50]">
                Nếu chọn số đã có, hai giáo viên sẽ tự đổi chỗ khi Lưu.
              </span>
            </label>
          </div>

          {field("bio", "Bio", true)}

          <AdminImageField
            url={form.imageUrl}
            uploading={photo.uploading}
            invalid={Boolean(fieldErrors.imageUrl)}
            error={fieldErrors.imageUrl}
            onFile={(file) => void handleUpload(file)}
          />

          <label className="flex items-center gap-2 text-sm font-semibold text-[#4A2306]">
            <input
              type="checkbox"
              checked={form.isPublished}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, isPublished: event.target.checked }))
              }
            />
            Published (hiện trang About)
          </label>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="primary"
              disabled={saving || photo.uploading}
              onClick={() => void handleSave()}
            >
              {photo.uploading ? "Đang upload..." : saving ? "Đang lưu..." : "Lưu"}
            </Button>
            <Button type="button" variant="outline" onClick={() => void closeForm()}>
              Hủy
            </Button>
          </div>
        </div>
      ) : null}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Xóa giáo viên?"
        description={
          deleteTarget
            ? `Bạn chắc muốn xóa “${deleteTarget.name}”?`
            : ""
        }
        busy={deleting}
        onCancel={() => {
          if (!deleting) setDeleteTarget(null);
        }}
        onConfirm={() => void handleDelete()}
      />
    </div>
  );
}
