"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

import { AdminImageField } from "@/components/admin/admin-image-field";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Button } from "@/components/ui/button";
import { useCloudinaryImageReplace } from "@/hooks/use-cloudinary-image-replace";
import { scrollToElement, scrollToFirstInvalid } from "@/lib/admin/scroll";
import { nextSortOrder } from "@/lib/admin/sort-order";
import { formatError } from "@/lib/errors/format-error";
import {
  createGalleryImage,
  deleteGalleryImage,
  listGalleryImages,
  updateGalleryImage,
} from "@/lib/gallery-images/api";
import type { GalleryImage, GalleryImagePayload } from "@/lib/gallery-images/types";
import { MAX_GALLERY_IMAGES } from "@/lib/gallery-images/types";
import { isHttpUrl } from "@/lib/media/is-http-url";

const EMPTY_FORM: GalleryImagePayload = {
  imageUrl: "",
  alt: "",
  objectPosition: "center",
  sortOrder: 0,
  isPublished: true,
};

export function GalleryImagesAdmin() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ alt?: string; imageUrl?: string }>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<GalleryImagePayload>(EMPTY_FORM);
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<GalleryImage | null>(null);
  const [deleting, setDeleting] = useState(false);

  const formRef = useRef<HTMLDivElement>(null);
  const editingIdRef = useRef<string | null>(null);
  editingIdRef.current = editingId;

  const cover = useCloudinaryImageReplace({
    category: "home-gallery",
    onLivePersist: async (url) => {
      const id = editingIdRef.current;
      if (id) await updateGalleryImage(id, { imageUrl: url });
    },
    onLiveRestore: async (url) => {
      const id = editingIdRef.current;
      if (id) await updateGalleryImage(id, { imageUrl: url });
    },
  });

  const load = async () => {
    setLoading(true);
    setListError(null);
    try {
      const response = await listGalleryImages({ publishedOnly: false });
      setImages(response.images);
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
    await cover.discard();
    setShowForm(false);
    setEditingId(null);
    setFormError(null);
    setFieldErrors({});
    cover.reset(null);
    setForm(EMPTY_FORM);
    await load();
  };

  const openCreate = async () => {
    if (images.length >= MAX_GALLERY_IMAGES) {
      setListError(`Chỉ tối đa ${MAX_GALLERY_IMAGES} ảnh. Xóa bớt rồi thêm mới.`);
      return;
    }
    await cover.discard();
    const nextOrder = nextSortOrder(images);
    setEditingId(null);
    setFormError(null);
    setFieldErrors({});
    cover.reset(null);
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

  const openEdit = async (image: GalleryImage) => {
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
    if (form.alt.trim().length < 2) errors.alt = "Alt text cần tối thiểu 2 ký tự";
    if (!isHttpUrl(form.imageUrl)) errors.imageUrl = "Chưa có ảnh — upload Cloudinary rồi lưu";
    setFieldErrors(errors);
    if (Object.keys(errors).length) {
      setFormError("Vui lòng sửa các ô còn lỗi trước khi lưu.");
      scrollToFirstInvalid(formRef.current);
      return;
    }

    setSaving(true);
    try {
      const payload: GalleryImagePayload = {
        ...form,
        imageUrl: form.imageUrl.trim(),
        alt: form.alt.trim(),
        objectPosition: form.objectPosition?.trim() || "center",
      };
      if (editingId) await updateGalleryImage(editingId, payload);
      else await createGalleryImage(payload);

      await cover.commit(payload.imageUrl);
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
      await deleteGalleryImage(deleteTarget.id);
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
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black text-[#4A2306] font-[family-name:var(--font-nunito)]">
            Môi trường học tập
          </h2>
          <p className="text-sm text-[#9B6B50]">
            Tối đa {MAX_GALLERY_IMAGES} ảnh · hiện {images.length}/{MAX_GALLERY_IMAGES}
          </p>
        </div>
        <Button
          type="button"
          variant={showForm && !editingId ? "outline" : "primary"}
          onClick={() => void toggleCreateForm()}
          disabled={!showForm && images.length >= MAX_GALLERY_IMAGES && !editingId}
        >
          {showForm && !editingId ? "Đóng form thêm" : "Thêm ảnh"}
        </Button>
      </div>

      {listError ? <p className="text-sm text-red-600">{listError}</p> : null}
      {loading ? <p className="text-sm text-[#9B6B50]">Đang tải...</p> : null}

      <div className="overflow-x-auto rounded-2xl border border-border bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-border bg-[#FFF9F5] text-[#9B6B50]">
            <tr>
              <th className="px-4 py-3 font-semibold">Ảnh</th>
              <th className="px-4 py-3 font-semibold">Alt</th>
              <th className="px-4 py-3 font-semibold">Order</th>
              <th className="px-4 py-3 font-semibold">Published</th>
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {images.map((image) => (
              <tr key={image.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3">
                  <div className="relative h-14 w-20 overflow-hidden rounded-lg border border-border bg-[#FFF9F5]">
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
                <td className="px-4 py-3">{image.isPublished ? "Có" : "Ẩn"}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => void openEdit(image)}
                    >
                      Sửa
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setDeleteTarget(image)}
                    >
                      Xóa
                    </Button>
                  </div>
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
            {editingId ? "Sửa ảnh" : "Thêm ảnh"}
          </h3>
          {formError ? <p className="text-sm text-red-600">{formError}</p> : null}

          <label className="block text-sm" data-invalid={fieldErrors.alt ? "true" : undefined}>
            <span className="mb-1 block font-semibold text-[#4A2306]">Alt text</span>
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
            <span className="mb-1 block font-semibold text-[#4A2306]">Thứ tự hiển thị</span>
            <input
              type="number"
              min={0}
              max={MAX_GALLERY_IMAGES - 1}
              className="w-full rounded-lg border border-border px-3 py-2"
              value={form.sortOrder}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, sortOrder: Number(event.target.value) }))
              }
            />
            <span className="mt-1 block text-xs text-[#9B6B50]">
              Nếu chọn số đã có, hai ảnh sẽ tự đổi chỗ khi Lưu.
            </span>
          </label>

          <AdminImageField
            url={form.imageUrl}
            uploading={cover.uploading}
            objectPosition={form.objectPosition}
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
            Published (hiện trang chủ)
          </label>

          <div className="flex gap-2">
            <Button
              type="button"
              disabled={saving || cover.uploading}
              onClick={() => void handleSave()}
            >
              {cover.uploading ? "Đang upload..." : saving ? "Đang lưu..." : "Lưu"}
            </Button>
            <Button type="button" variant="outline" onClick={() => void closeForm()}>
              Hủy
            </Button>
          </div>
        </div>
      ) : null}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Xóa ảnh gallery?"
        description={
          deleteTarget
            ? `Bạn chắc muốn xóa ảnh “${deleteTarget.alt}”?`
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
