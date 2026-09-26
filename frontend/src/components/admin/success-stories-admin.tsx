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
import { RowActions } from "./row-actions";
import { useAdminResourceList } from "@/hooks/use-admin-resource-list";
import { useBulkSelection } from "@/hooks/use-bulk-selection";
import { useCloudinaryImageReplace } from "@/hooks/use-cloudinary-image-replace";
import { listCourses } from "@/lib/courses/api";
import type { Course } from "@/lib/courses/types";
import { scrollToFirstInvalid } from "@/lib/admin/scroll";
import { nextSortOrder } from "@/lib/admin/sort-order";
import { formatError } from "@/lib/errors/format-error";
import { isHttpUrl } from "@/lib/media/is-http-url";
import {
  createSuccessStory,
  deleteSuccessStory,
  listSuccessStories,
  updateSuccessStory,
} from "@/lib/success-stories/api";
import type { SuccessStory, SuccessStoryPayload } from "@/lib/success-stories/types";

const EMPTY_FORM: SuccessStoryPayload = {
  name: "",
  course: "",
  badge: "",
  text: "",
  stars: 5,
  avatar: "",
  imageUrl: "",
  sortOrder: 0,
  isPublished: true,
};

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  const first = parts[0][0] ?? "";
  const last = parts[parts.length - 1][0] ?? "";
  return `${first}${last}`.toUpperCase();
}

export function SuccessStoriesAdmin() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [form, setForm] = useState<SuccessStoryPayload>(EMPTY_FORM);

  const loadItems = useCallback(async () => {
    const [storiesRes, coursesRes] = await Promise.all([
      listSuccessStories({ publishedOnly: false }),
      listCourses({ publishedOnly: false }),
    ]);
    setCourses(coursesRes.courses);
    return storiesRes.stories;
  }, []);

  const {
    items: stories,
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
  } = useAdminResourceList<SuccessStory>({ loadItems });

  const bulk = useBulkSelection(stories.map((item) => item.id));
  const editingIdRef = useRef<string | null>(null);
  editingIdRef.current = editingId;

  const cover = useCloudinaryImageReplace({
    category: "success-story",
    onLivePersist: async (url) => {
      const id = editingIdRef.current;
      if (id) await updateSuccessStory(id, { imageUrl: url });
    },
    onLiveRestore: async (url) => {
      const id = editingIdRef.current;
      if (id) await updateSuccessStory(id, { imageUrl: url });
    },
  });

  const courseOptions = (() => {
    const titles = courses.map((course) => course.title);
    if (form.course && !titles.includes(form.course)) {
      return [form.course, ...titles];
    }
    return titles;
  })();

  const closeForm = async () => {
    await cover.discard();
    resetFormChrome();
    setFormError(null);
    cover.reset(null);
    setForm(EMPTY_FORM);
  };

  const openCreate = async () => {
    await cover.discard();
    setEditingId(null);
    setFormError(null);
    cover.reset(null);
    setForm({
      ...EMPTY_FORM,
      course: courses[0]?.title ?? "",
      sortOrder: nextSortOrder(stories),
    });
    setShowForm(true);
  };

  const toggleCreateForm = async () => {
    if (showForm && !editingId) {
      await closeForm();
      return;
    }
    await openCreate();
  };

  const openEdit = async (story: SuccessStory) => {
    await cover.discard();
    setEditingId(story.id);
    setFormError(null);
    cover.reset(story.imageUrl);
    setForm({
      name: story.name,
      course: story.course,
      badge: story.badge,
      text: story.text,
      stars: story.stars,
      avatar: story.avatar,
      imageUrl: story.imageUrl ?? "",
      sortOrder: story.sortOrder,
      isPublished: story.isPublished,
    });
    setShowForm(true);
  };

  const handleUpload = async (file: File | null) => {
    setFormError(null);
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
    if (form.name.trim().length < 2) {
      setFormError("Tên học viên cần tối thiểu 2 ký tự");
      scrollToFirstInvalid(formRef.current);
      return;
    }
    if (!form.course.trim()) {
      setFormError("Chọn khóa học");
      scrollToFirstInvalid(formRef.current);
      return;
    }
    if (form.badge.trim().length < 2) {
      setFormError("Nhãn ngắn cần tối thiểu 2 ký tự");
      scrollToFirstInvalid(formRef.current);
      return;
    }
    if (form.text.trim().length < 5) {
      setFormError("Comment cần tối thiểu 5 ký tự");
      scrollToFirstInvalid(formRef.current);
      return;
    }
    if (!form.avatar.trim()) {
      setFormError("Nhập chữ viết tắt avatar (1–4 ký tự)");
      scrollToFirstInvalid(formRef.current);
      return;
    }

    setSaving(true);
    try {
      const payload: SuccessStoryPayload = {
        ...form,
        name: form.name.trim(),
        course: form.course.trim(),
        badge: form.badge.trim(),
        text: form.text.trim(),
        avatar: form.avatar.trim().toUpperCase().slice(0, 4),
        imageUrl: isHttpUrl(form.imageUrl) ? form.imageUrl!.trim() : null,
      };
      if (editingId) await updateSuccessStory(editingId, payload);
      else await createSuccessStory(payload);
      if (payload.imageUrl) await cover.commit(payload.imageUrl);
      else await cover.discard();
      await closeForm();
      await load();
    } catch (err) {
      setFormError(formatError(err));
    } finally {
      setSaving(false);
    }
  };

  const handleBulkDelete = async () => {
    setListError(null);
    try {
      await bulk.runOnSelected(deleteSuccessStory);
      await load();
    } catch (err) {
      setListError(formatError(err));
      bulk.closeConfirm();
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setListError(null);
    try {
      await deleteSuccessStory(deleteTarget.id);
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
          <h2 className="text-2xl font-black text-foreground font-[family-name:var(--font-nunito)]">
            Câu chuyện thành công
          </h2>
          <p className="text-sm text-muted-foreground">
            Ảnh học viên/chứng chỉ + comment ngắn. Folder Cloudinary: success-stories.
          </p>
        </div>
        <Button
          type="button"
          variant={showForm && !editingId ? "outline" : "primary"}
          onClick={() => void toggleCreateForm()}
        >
          {showForm && !editingId ? "Đóng form thêm" : "Thêm câu chuyện"}
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
        <table className="min-w-[820px] text-left text-sm lg:min-w-full">
          <thead className="border-b border-border bg-muted text-muted-foreground">
            <tr>
              <SelectAllHeaderCell allSelected={bulk.allSelected} onToggle={bulk.toggleAll} />
              <th className="px-4 py-3 font-semibold">Ảnh</th>
              <th className="px-4 py-3 font-semibold">Học viên</th>
              <th className="px-4 py-3 font-semibold">Comment</th>
              <th className="px-4 py-3 font-semibold">Order</th>
              <th className="px-4 py-3 font-semibold">Published</th>
              <th className="px-4 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {stories.map((story) => (
              <tr key={story.id} className="border-b border-border last:border-0">
                <SelectRowCell
                  checked={bulk.isSelected(story.id)}
                  onToggle={() => bulk.toggle(story.id)}
                  label={story.name}
                />
                <td className="px-4 py-3">
                  <div className="relative h-14 w-12 overflow-hidden rounded-lg border border-border bg-muted">
                    {story.imageUrl ? (
                      <Image
                        src={story.imageUrl}
                        alt={story.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <span className="flex h-full items-center justify-center text-xs font-bold text-primary">
                        {story.avatar}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="font-semibold text-foreground">{story.name}</div>
                  <div className="text-xs text-muted-foreground">{story.course}</div>
                </td>
                <td className="max-w-xs px-4 py-3">
                  <div className="line-clamp-2 text-muted-foreground">{story.text}</div>
                </td>
                <td className="px-4 py-3">{story.sortOrder}</td>
                <td className="px-4 py-3">{story.isPublished ? "Có" : "Ẩn"}</td>
                <td className="px-4 py-3">
                  <RowActions
                    onEdit={() => void openEdit(story)}
                    onDelete={() => setDeleteTarget(story)}
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
          className="scroll-mt-6 space-y-4 rounded-2xl border border-border bg-card p-5"
        >
          <h3 className="text-lg font-black text-foreground font-[family-name:var(--font-nunito)]">
            {editingId ? "Sửa câu chuyện" : "Thêm câu chuyện"}
          </h3>
          {formError ? <p className="text-sm text-red-600">{formError}</p> : null}

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-1 block font-semibold text-foreground">Tên / phụ huynh</span>
              <input
                className="h-11 w-full rounded-lg border border-border px-3 py-2"
                value={form.name}
                onChange={(event) => {
                  const name = event.target.value;
                  setForm((prev) => ({
                    ...prev,
                    name,
                    avatar:
                      !prev.avatar || prev.avatar === initialsFromName(prev.name)
                        ? initialsFromName(name)
                        : prev.avatar,
                  }));
                }}
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-semibold text-foreground">Khóa học</span>
              <select
                className="h-11 w-full rounded-lg border border-border bg-card px-3 py-2"
                value={form.course}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, course: event.target.value }))
                }
              >
                <option value="">Chọn khóa học</option>
                {courseOptions.map((title) => (
                  <option key={title} value={title}>
                    {title}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-semibold text-foreground">Nhãn ngắn</span>
              <input
                className="h-11 w-full rounded-lg border border-border px-3 py-2"
                value={form.badge}
                placeholder="Vd: Thích đến lớp"
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, badge: event.target.value }))
                }
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-semibold text-foreground">Chữ avatar (fallback)</span>
              <input
                className="h-11 w-full rounded-lg border border-border px-3 py-2"
                value={form.avatar}
                maxLength={4}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    avatar: event.target.value.toUpperCase().slice(0, 4),
                  }))
                }
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-semibold text-foreground">Số sao</span>
              <select
                className="h-11 w-full rounded-lg border border-border bg-card px-3 py-2"
                value={form.stars}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, stars: Number(event.target.value) }))
                }
              >
                {[5, 4, 3, 2, 1].map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-semibold text-foreground">Thứ tự</span>
              <input
                type="number"
                min={0}
                className="h-11 w-full rounded-lg border border-border px-3 py-2"
                value={form.sortOrder}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, sortOrder: Number(event.target.value) }))
                }
              />
            </label>
          </div>

          <label className="block text-sm">
            <span className="mb-1 block font-semibold text-foreground">Comment ngắn *</span>
            <textarea
              className="min-h-24 w-full rounded-lg border border-border px-3 py-2"
              maxLength={280}
              value={form.text}
              placeholder="Vài câu thật, không marketing dài…"
              onChange={(event) => setForm((prev) => ({ ...prev, text: event.target.value }))}
            />
            <span className="mt-1 block text-xs text-muted-foreground">
              {form.text.length}/280
            </span>
          </label>

          <AdminImageField
            url={form.imageUrl ?? ""}
            uploading={cover.uploading}
            objectPosition="center"
            onFile={(file) => void handleUpload(file)}
          />
          <p className="text-xs text-muted-foreground">
            Ảnh học viên, lớp hoặc chứng chỉ/điểm thi.
          </p>

          <label className="flex items-center gap-2 text-sm font-semibold">
            <input
              type="checkbox"
              checked={form.isPublished}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, isPublished: event.target.checked }))
              }
            />
            Published
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
        title="Xóa câu chuyện?"
        description={deleteTarget ? `Xóa “${deleteTarget.name}”?` : ""}
        busy={deleting}
        onCancel={() => {
          if (!deleting) setDeleteTarget(null);
        }}
        onConfirm={() => void handleDelete()}
      />
      <ConfirmDialog
        open={bulk.confirmOpen}
        title="Xóa các mục đã chọn?"
        description={`Xóa ${bulk.count} câu chuyện đã chọn?`}
        busy={bulk.busy}
        onCancel={() => {
          if (!bulk.busy) bulk.closeConfirm();
        }}
        onConfirm={() => void handleBulkDelete()}
      />
    </div>
  );
}
