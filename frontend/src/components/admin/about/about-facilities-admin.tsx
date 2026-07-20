"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";

import { AdminImageField } from "@/components/admin/admin-image-field";
import {
  BulkActionsBar,
  SelectAllHeaderCell,
  SelectRowCell,
} from "@/components/admin/bulk-actions-bar";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Button } from "@/components/ui/button";
import { useAdminResourceList } from "@/hooks/use-admin-resource-list";
import { useBulkSelection } from "@/hooks/use-bulk-selection";
import { useCloudinaryImageReplace } from "@/hooks/use-cloudinary-image-replace";
import { scrollToFirstInvalid } from "@/lib/admin/scroll";
import { nextSortOrder } from "@/lib/admin/sort-order";
import { formatError } from "@/lib/errors/format-error";
import {
  createFacilityImage,
  deleteFacilityImage,
  listFacilityImages,
  updateFacilityImage,
} from "@/lib/facility-images/api";
import type { FacilityImage, FacilityImagePayload } from "@/lib/facility-images/types";
import { MAX_FACILITY_IMAGES } from "@/lib/facility-images/types";
import { isHttpUrl } from "@/lib/media/is-http-url";

const EMPTY_FACILITY_FORM: FacilityImagePayload = {
  imageUrl: "",
  title: "",
  sortOrder: 0,
  isPublished: true,
};

export function AboutFacilitiesAdmin() {
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ title?: string; imageUrl?: string }>({});
  const [form, setForm] = useState<FacilityImagePayload>(EMPTY_FACILITY_FORM);

  const loadItems = useCallback(async () => {
    const response = await listFacilityImages({ publishedOnly: false });
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
  } = useAdminResourceList<FacilityImage>({ loadItems });

  const bulk = useBulkSelection(images.map((item) => item.id));

  const editingIdRef = useRef<string | null>(null);
  editingIdRef.current = editingId;

  const facilityImage = useCloudinaryImageReplace({
    category: "about-facilities",
    onLivePersist: async (url) => {
      const id = editingIdRef.current;
      if (id) await updateFacilityImage(id, { imageUrl: url });
    },
    onLiveRestore: async (url) => {
      const id = editingIdRef.current;
      if (id) await updateFacilityImage(id, { imageUrl: url });
    },
  });

  const closeFacilityForm = async () => {
    await facilityImage.discard();
    resetFormChrome();
    setFormError(null);
    setFieldErrors({});
    facilityImage.reset(null);
    setForm(EMPTY_FACILITY_FORM);
  };

  const openCreateFacility = async () => {
    if (images.length >= MAX_FACILITY_IMAGES) {
      setListError(`Chỉ tối đa ${MAX_FACILITY_IMAGES} ảnh. Xóa bớt rồi thêm mới.`);
      return;
    }
    await facilityImage.discard();
    const nextOrder = nextSortOrder(images);
    setEditingId(null);
    setFormError(null);
    setFieldErrors({});
    facilityImage.reset(null);
    setForm({ ...EMPTY_FACILITY_FORM, sortOrder: nextOrder });
    setShowForm(true);
  };

  const toggleCreateFacility = async () => {
    if (showForm && !editingId) {
      await closeFacilityForm();
      return;
    }
    await openCreateFacility();
  };

  const openEditFacility = async (image: FacilityImage) => {
    await facilityImage.discard();
    setEditingId(image.id);
    setFormError(null);
    setFieldErrors({});
    facilityImage.reset(image.imageUrl);
    setForm({
      imageUrl: image.imageUrl,
      title: image.title,
      sortOrder: image.sortOrder,
      isPublished: image.isPublished,
    });
    setShowForm(true);
  };

  const handleFacilityUpload = async (file: File | null) => {
    setFormError(null);
    setFieldErrors((prev) => ({ ...prev, imageUrl: undefined }));
    try {
      const url = await facilityImage.upload(file);
      if (url) setForm((prev) => ({ ...prev, imageUrl: url }));
    } catch (err) {
      setFormError(formatError(err));
      scrollToFirstInvalid(formRef.current);
    }
  };

  const handleFacilitySave = async () => {
    setFormError(null);
    const errors: { title?: string; imageUrl?: string } = {};
    if (form.title.trim().length < 2) errors.title = "Tiêu đề ảnh cần tối thiểu 2 ký tự";
    if (!isHttpUrl(form.imageUrl)) errors.imageUrl = "Chưa có ảnh — vui lòng chọn ảnh rồi lưu";
    setFieldErrors(errors);
    if (Object.keys(errors).length) {
      setFormError("Vui lòng sửa các ô còn lỗi trước khi lưu.");
      scrollToFirstInvalid(formRef.current);
      return;
    }

    setSaving(true);
    try {
      const payload: FacilityImagePayload = {
        ...form,
        imageUrl: form.imageUrl.trim(),
        title: form.title.trim(),
      };
      if (editingId) await updateFacilityImage(editingId, payload);
      else await createFacilityImage(payload);

      await facilityImage.commit(payload.imageUrl);
      resetFormChrome();
      setForm(EMPTY_FACILITY_FORM);
      await load();
    } catch (err) {
      setFormError(formatError(err));
      scrollToFirstInvalid(formRef.current);
    } finally {
      setSaving(false);
    }
  };

  const handleBulkDelete = async () => {
    setListError(null);
    try {
      await bulk.runOnSelected(deleteFacilityImage);
      await load();
    } catch (err) {
      setListError(formatError(err));
      bulk.closeConfirm();
    }
  };


  const handleFacilityDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setListError(null);
    try {
      await deleteFacilityImage(deleteTarget.id);
      if (editingId === deleteTarget.id) await closeFacilityForm();
      setDeleteTarget(null);
      await load();
    } catch (err) {
      setListError(formatError(err));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black text-foreground font-[family-name:var(--font-nunito)]">
            Cơ sở vật chất
          </h2>
          <p className="text-sm text-muted-foreground">
            Tối đa {MAX_FACILITY_IMAGES} ảnh · hiện {images.length}/{MAX_FACILITY_IMAGES}
          </p>
        </div>
        <Button
          type="button"
          variant={showForm && !editingId ? "outline" : "primary"}
          onClick={() => void toggleCreateFacility()}
          disabled={!showForm && images.length >= MAX_FACILITY_IMAGES && !editingId}
        >
          {showForm && !editingId ? "Đóng form thêm" : "Thêm ảnh"}
        </Button>
      </div>

      {listError ? <p className="text-sm text-red-600">{listError}</p> : null}
      {loading ? <p className="text-sm text-muted-foreground">Đang tải...</p> : null}

      <BulkActionsBar
        count={bulk.count}
        busy={bulk.busy}
        onDelete={bulk.openConfirm}
        onClear={bulk.clear}
      />

      <div className="overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-border bg-muted text-muted-foreground">
            <tr>
              <SelectAllHeaderCell
                allSelected={bulk.allSelected}
                onToggle={bulk.toggleAll}
              />
              <th className="px-4 py-3 font-semibold">Ảnh</th>
              <th className="px-4 py-3 font-semibold">Tiêu đề</th>
              <th className="px-4 py-3 font-semibold">Order</th>
              <th className="px-4 py-3 font-semibold">Published</th>
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {images.map((image) => (
              <tr key={image.id} className="border-b border-border last:border-0">
                <SelectRowCell
                  checked={bulk.isSelected(image.id)}
                  onToggle={() => bulk.toggle(image.id)}
                  label={image.title}
                />
                <td className="px-4 py-3">
                  <div className="relative h-14 w-20 overflow-hidden rounded-lg border border-border bg-muted">
                    <Image
                      src={image.imageUrl}
                      alt={image.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                </td>
                <td className="max-w-xs truncate px-4 py-3">{image.title}</td>
                <td className="px-4 py-3">{image.sortOrder}</td>
                <td className="px-4 py-3">{image.isPublished ? "Có" : "Ẩn"}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => void openEditFacility(image)}
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
          className="scroll-mt-6 space-y-4 rounded-2xl border border-border bg-card p-5"
        >
          <h3 className="text-lg font-black text-foreground font-[family-name:var(--font-nunito)]">
            {editingId ? "Sửa ảnh cơ sở" : "Thêm ảnh cơ sở"}
          </h3>
          {formError ? <p className="text-sm text-red-600">{formError}</p> : null}

          <label className="block text-sm" data-invalid={fieldErrors.title ? "true" : undefined}>
            <span className="mb-1 block font-semibold text-foreground">
              Tiêu đề (label trên ảnh)
            </span>
            <input
              className={`w-full rounded-lg border px-3 py-2 ${
                fieldErrors.title ? "border-red-500" : "border-border"
              }`}
              value={form.title}
              onChange={(event) => {
                setForm((prev) => ({ ...prev, title: event.target.value }));
                setFieldErrors((prev) => ({ ...prev, title: undefined }));
              }}
            />
            {fieldErrors.title ? (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.title}</p>
            ) : null}
          </label>

          <label className="block text-sm md:max-w-xs">
            <span className="mb-1 block font-semibold text-foreground">Thứ tự hiển thị</span>
            <input
              type="number"
              min={0}
              max={MAX_FACILITY_IMAGES - 1}
              className="w-full rounded-lg border border-border px-3 py-2"
              value={form.sortOrder}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, sortOrder: Number(event.target.value) }))
              }
            />
            <span className="mt-1 block text-xs text-muted-foreground">
              Nếu chọn số đã có, hai ảnh sẽ tự đổi chỗ khi Lưu.
            </span>
          </label>

          <AdminImageField
            url={form.imageUrl}
            uploading={facilityImage.uploading}
            invalid={Boolean(fieldErrors.imageUrl)}
            error={fieldErrors.imageUrl}
            onFile={(file) => void handleFacilityUpload(file)}
          />

          <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
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
              disabled={saving || facilityImage.uploading}
              onClick={() => void handleFacilitySave()}
            >
              {facilityImage.uploading
                ? "Đang upload..."
                : saving
                  ? "Đang lưu..."
                  : "Lưu"}
            </Button>
            <Button type="button" variant="outline" onClick={() => void closeFacilityForm()}>
              Hủy
            </Button>
          </div>
        </div>
      ) : null}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Xóa ảnh cơ sở?"
        description={
          deleteTarget
            ? `Bạn chắc muốn xóa ảnh “${deleteTarget.title}”?`
            : ""
        }
        busy={deleting}
        onCancel={() => {
          if (!deleting) setDeleteTarget(null);
        }}
        onConfirm={() => void handleFacilityDelete()}
      />

      <ConfirmDialog
        open={bulk.confirmOpen}
        title="Xóa các mục đã chọn?"
        description={`Bạn chắc muốn xóa ${bulk.count} ảnh đã chọn? Thao tác này không hoàn tác được.`}
        busy={bulk.busy}
        onCancel={() => {
          if (!bulk.busy) bulk.closeConfirm();
        }}
        onConfirm={() => void handleBulkDelete()}
      />
    </section>
  );
}
