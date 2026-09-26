"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";

import { AdminImageField } from "@/components/admin/admin-image-field";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { RowActions } from "@/components/admin/row-actions";
import { Button } from "@/components/ui/button";
import { useAdminResourceList } from "@/hooks/use-admin-resource-list";
import { useCloudinaryImageReplace } from "@/hooks/use-cloudinary-image-replace";
import { scrollToFirstInvalid } from "@/lib/admin/scroll";
import { nextSortOrder } from "@/lib/admin/sort-order";
import {
  createEventPhoto,
  deleteEventPhoto,
  listEventPhotos,
  updateEventPhoto,
} from "@/lib/event-photos/api";
import type { EventPhoto, EventPhotoPayload } from "@/lib/event-photos/types";
import { MAX_EVENT_PHOTOS } from "@/lib/event-photos/types";
import { formatError } from "@/lib/errors/format-error";
import { isHttpUrl } from "@/lib/media/is-http-url";

const EMPTY_FORM: EventPhotoPayload = {
  imageUrl: "",
  alt: "",
  objectPosition: "center",
  sortOrder: 0,
  isPublished: true,
};

export function EventPhotosAdmin() {
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ alt?: string; imageUrl?: string }>({});
  const [form, setForm] = useState<EventPhotoPayload>(EMPTY_FORM);

  const loadItems = useCallback(async () => {
    const response = await listEventPhotos({ publishedOnly: false });
    return response.images;
  }, []);

  const {
    items: images,
    loading,
    listError,
    setListError,
    showForm,
    setShowForm,
    editingId,
    setEditingId,
    deleteTarget,
    setDeleteTarget,
    deleting,
    setDeleting,
    formRef,
    load,
    resetFormChrome,
  } = useAdminResourceList<EventPhoto>({ loadItems });

  const editingIdRef = useRef<string | null>(null);
  editingIdRef.current = editingId;

  const cover = useCloudinaryImageReplace({
    category: "event-photo",
    onLivePersist: async (url) => {
      const id = editingIdRef.current;
      if (id) await updateEventPhoto(id, { imageUrl: url });
    },
    onLiveRestore: async (url) => {
      const id = editingIdRef.current;
      if (id) await updateEventPhoto(id, { imageUrl: url });
    },
  });

  const closeForm = async () => {
    await cover.discard();
    resetFormChrome();
    setFormError(null);
    setFieldErrors({});
    cover.reset(null);
    setForm(EMPTY_FORM);
  };

  const openCreate = async () => {
    if (images.length >= MAX_EVENT_PHOTOS) {
      setListError(`Chỉ tối đa ${MAX_EVENT_PHOTOS} ảnh. Xóa bớt rồi thêm mới.`);
      return;
    }
    await cover.discard();
    setEditingId(null);
    setFormError(null);
    setFieldErrors({});
    cover.reset(null);
    setForm({ ...EMPTY_FORM, sortOrder: nextSortOrder(images) });
    setShowForm(true);
  };

  const openEdit = async (image: EventPhoto) => {
    await cover.discard();
    setEditingId(image.id);
    setFormError(null);
    setFieldErrors({});
    cover.reset(image.imageUrl);
    setForm({
      imageUrl: image.imageUrl,
      alt: image.alt,
      objectPosition: image.objectPosition,
      sortOrder: image.sortOrder,
      isPublished: image.isPublished,
    });
    setShowForm(true);
  };

  const handleUpload = async (file: File | null) => {
    setFormError(null);
    setFieldErrors((prev) => ({ ...prev, imageUrl: undefined }));
    try {
      const url = await cover.upload(file);
      if (url) setForm((prev) => ({ ...prev, imageUrl: url }));
    } catch (err) {
      setFormError(formatError(err));
      scrollToFirstInvalid(formRef.current);
    }
  };

  const handleSave = async () => {
    setFormError(null);
    const errors: { alt?: string; imageUrl?: string } = {};
    if (form.alt.trim().length < 2) errors.alt = "Mô tả ảnh cần tối thiểu 2 ký tự";
    if (!isHttpUrl(form.imageUrl)) errors.imageUrl = "Chưa có ảnh — vui lòng chọn ảnh rồi lưu";
    setFieldErrors(errors);
    if (Object.keys(errors).length) {
      setFormError("Vui lòng sửa các ô còn lỗi trước khi lưu.");
      scrollToFirstInvalid(formRef.current);
      return;
    }

    setSaving(true);
    try {
      const payload: EventPhotoPayload = {
        ...form,
        imageUrl: form.imageUrl.trim(),
        alt: form.alt.trim(),
        objectPosition: form.objectPosition?.trim() || "center",
      };
      if (editingId) await updateEventPhoto(editingId, payload);
      else await createEventPhoto(payload);
      await cover.commit(payload.imageUrl);
      resetFormChrome();
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
      await deleteEventPhoto(deleteTarget.id);
      if (editingId === deleteTarget.id) await closeForm();
      setDeleteTarget(null);
      await load();
    } catch (err) {
      setListError(formatError(err));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-foreground font-[family-name:var(--font-nunito)]">
            Ảnh hoạt động
          </h2>
          <p className="text-sm text-muted-foreground">
            Album “Khoảnh khắc tại DKS” trên /su-kien · {images.length}/{MAX_EVENT_PHOTOS}
          </p>
        </div>
        <Button
          type="button"
          variant={showForm && !editingId ? "outline" : "primary"}
          onClick={() => void (showForm && !editingId ? closeForm() : openCreate())}
          disabled={!showForm && images.length >= MAX_EVENT_PHOTOS && !editingId}
        >
          {showForm && !editingId ? "Đóng form" : "Thêm ảnh"}
        </Button>
      </div>

      {listError ? <p className="text-sm text-red-600">{listError}</p> : null}
      {loading ? <p className="text-sm text-muted-foreground">Đang tải ảnh…</p> : null}

      <div className="overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-border bg-muted text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-semibold">Ảnh</th>
              <th className="px-4 py-3 font-semibold">Mô tả</th>
              <th className="px-4 py-3 font-semibold">Thứ tự</th>
              <th className="px-4 py-3 font-semibold">Trạng thái</th>
              <th className="px-4 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {images.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  Chưa có ảnh — thêm ảnh hoạt động để hiện trên trang Sự kiện.
                </td>
              </tr>
            ) : (
              images.map((image) => (
                <tr key={image.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    <div className="relative h-14 w-20 overflow-hidden rounded-lg border border-border bg-muted">
                      <Image
                        src={image.imageUrl}
                        alt={image.alt}
                        fill
                        className="object-cover"
                        unoptimized
                        style={{ objectPosition: image.objectPosition }}
                      />
                    </div>
                  </td>
                  <td className="max-w-xs truncate px-4 py-3">{image.alt}</td>
                  <td className="px-4 py-3">{image.sortOrder}</td>
                  <td className="px-4 py-3">{image.isPublished ? "Công khai" : "Ẩn"}</td>
                  <td className="px-4 py-3">
                    <RowActions
                      onEdit={() => void openEdit(image)}
                      onDelete={() => setDeleteTarget(image)}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showForm ? (
        <div
          ref={formRef}
          className="scroll-mt-6 space-y-4 rounded-2xl border border-border bg-card p-5"
        >
          <h3 className="text-lg font-black text-foreground font-[family-name:var(--font-nunito)]">
            {editingId ? "Sửa ảnh" : "Thêm ảnh"}
          </h3>
          {formError ? <p className="text-sm text-red-600">{formError}</p> : null}

          <label className="block text-sm" data-invalid={fieldErrors.alt ? "true" : undefined}>
            <span className="mb-1 block font-semibold text-foreground">Mô tả ảnh *</span>
            <input
              className={`w-full rounded-lg border px-3 py-2 ${
                fieldErrors.alt ? "border-red-500" : "border-border"
              }`}
              value={form.alt}
              onChange={(event) => {
                setForm((prev) => ({ ...prev, alt: event.target.value }));
                setFieldErrors((prev) => ({ ...prev, alt: undefined }));
              }}
            />
            {fieldErrors.alt ? (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.alt}</p>
            ) : null}
          </label>

          <label className="block text-sm md:max-w-xs">
            <span className="mb-1 block font-semibold text-foreground">Thứ tự hiển thị</span>
            <input
              type="number"
              min={0}
              max={MAX_EVENT_PHOTOS - 1}
              className="w-full rounded-lg border border-border px-3 py-2"
              value={form.sortOrder}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, sortOrder: Number(event.target.value) }))
              }
            />
          </label>

          <AdminImageField
            url={form.imageUrl}
            uploading={cover.uploading}
            objectPosition={form.objectPosition}
            invalid={Boolean(fieldErrors.imageUrl)}
            error={fieldErrors.imageUrl}
            onFile={(file) => void handleUpload(file)}
          />

          <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <input
              type="checkbox"
              checked={form.isPublished}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, isPublished: event.target.checked }))
              }
            />
            Công khai trên /su-kien
          </label>

          <div className="flex gap-2">
            <Button
              type="button"
              disabled={saving || cover.uploading}
              onClick={() => void handleSave()}
            >
              {cover.uploading ? "Đang upload…" : saving ? "Đang lưu…" : "Lưu"}
            </Button>
            <Button type="button" variant="outline" onClick={() => void closeForm()}>
              Hủy
            </Button>
          </div>
        </div>
      ) : null}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Xóa ảnh sự kiện?"
        description={
          deleteTarget ? `Xóa ảnh “${deleteTarget.alt}”?` : ""
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
