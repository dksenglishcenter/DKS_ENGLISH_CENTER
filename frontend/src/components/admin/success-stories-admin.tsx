"use client";

import { useCallback, useState } from "react";

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
import { listCourses } from "@/lib/courses/api";
import type { Course } from "@/lib/courses/types";
import { scrollToFirstInvalid } from "@/lib/admin/scroll";
import { nextSortOrder } from "@/lib/admin/sort-order";
import { formatError } from "@/lib/errors/format-error";
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
  sortOrder: 0,
  isPublished: true,
};

/** Chữ viết tắt trên vòng tròn avatar (vd: Nguyễn Thị Mai → NM). */
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

  const courseOptions = (() => {
    const titles = courses.map((course) => course.title);
    if (form.course && !titles.includes(form.course)) {
      return [form.course, ...titles];
    }
    return titles;
  })();

  const closeForm = () => {
    resetFormChrome();
    setFormError(null);
    setForm(EMPTY_FORM);
  };

  const openCreate = () => {
    const nextOrder = nextSortOrder(stories);
    setEditingId(null);
    setFormError(null);
    setForm({
      ...EMPTY_FORM,
      course: courses[0]?.title ?? "",
      sortOrder: nextOrder,
    });
    setShowForm(true);
  };

  const toggleCreateForm = () => {
    if (showForm && !editingId) {
      closeForm();
      return;
    }
    openCreate();
  };

  const openEdit = (story: SuccessStory) => {
    setEditingId(story.id);
    setFormError(null);
    setForm({
      name: story.name,
      course: story.course,
      badge: story.badge,
      text: story.text,
      stars: story.stars,
      avatar: story.avatar,
      sortOrder: story.sortOrder,
      isPublished: story.isPublished,
    });
    setShowForm(true);
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
      setFormError("Badge cần tối thiểu 2 ký tự");
      scrollToFirstInvalid(formRef.current);
      return;
    }
    if (form.text.trim().length < 10) {
      setFormError("Nội dung cần tối thiểu 10 ký tự");
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
      };
      if (editingId) await updateSuccessStory(editingId, payload);
      else await createSuccessStory(payload);
      closeForm();
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
      if (editingId === deleteTarget.id) closeForm();
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
        <h2 className="text-2xl font-black text-foreground font-[family-name:var(--font-nunito)]">
          Câu chuyện thành công
        </h2>
        <Button
          type="button"
          variant={showForm && !editingId ? "outline" : "primary"}
          onClick={toggleCreateForm}
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
              <SelectAllHeaderCell
                allSelected={bulk.allSelected}
                onToggle={bulk.toggleAll}
              />
              <th className="w-44 min-w-44 px-4 py-3 font-semibold lg:w-auto lg:min-w-0">Học viên</th>
              <th className="w-52 min-w-52 px-4 py-3 font-semibold lg:w-auto lg:min-w-0">Khóa</th>
              <th className="w-56 min-w-56 px-4 py-3 font-semibold lg:w-auto lg:min-w-0">Badge</th>
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
                <td className="w-44 min-w-44 px-4 py-3 lg:w-auto lg:min-w-0">
                  <div
                    className="line-clamp-2 font-semibold leading-snug text-foreground lg:line-clamp-none"
                    title={story.name}
                  >
                    {story.name}
                  </div>
                  <div className="truncate text-xs text-muted-foreground lg:overflow-visible lg:whitespace-normal">
                    {story.avatar}
                  </div>
                </td>
                <td className="w-52 min-w-52 px-4 py-3 lg:w-auto lg:min-w-0">
                  <div className="line-clamp-2 lg:line-clamp-none" title={story.course}>
                    {story.course}
                  </div>
                </td>
                <td className="w-56 min-w-56 px-4 py-3 lg:w-auto lg:min-w-0">
                  <div className="line-clamp-2 leading-snug lg:line-clamp-none" title={story.badge}>
                    {story.badge}
                  </div>
                </td>
                <td className="whitespace-nowrap px-4 py-3 lg:whitespace-normal">{story.sortOrder}</td>
                <td className="whitespace-nowrap px-4 py-3 lg:whitespace-normal">{story.isPublished ? "Có" : "Ẩn"}</td>
                <td className="px-4 py-3">
                  <RowActions
                    onEdit={() => openEdit(story)}
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
              <span className="mb-1 block font-semibold text-foreground">Tên học viên</span>
              <input
                className="h-11 w-full rounded-lg border border-border px-3 py-2 lg:h-auto"
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
                className="h-11 w-full rounded-lg border border-border bg-card px-3 py-2 lg:h-auto"
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
              {courses.length === 0 ? (
                <span className="mt-1 block text-xs text-red-600">
                  Chưa có khóa học — thêm ở menu Khóa học trước.
                </span>
              ) : null}
            </label>

            <label className="block text-sm">
              <span className="mb-1 block font-semibold text-foreground">Badge thành tích</span>
              <input
                className="h-11 w-full rounded-lg border border-border px-3 py-2 lg:h-auto"
                value={form.badge}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, badge: event.target.value }))
                }
              />
            </label>

            <label className="block text-sm">
              <span className="mb-1 block font-semibold text-foreground">Chữ trên avatar</span>
              <input
                className="h-11 w-full rounded-lg border border-border px-3 py-2 lg:h-auto"
                value={form.avatar}
                maxLength={4}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    avatar: event.target.value.toUpperCase().slice(0, 4),
                  }))
                }
              />
              <span className="mt-1 block text-xs text-muted-foreground">
                1–4 chữ hiện trong vòng tròn cam trên trang chủ (vd: MT, NM).
              </span>
            </label>

            <label className="block text-sm">
              <span className="mb-1 block font-semibold text-foreground">Số sao</span>
              <select
                className="h-11 w-full rounded-lg border border-border bg-card px-3 py-2 lg:h-auto"
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
              <span className="mb-1 block font-semibold text-foreground">Thứ tự hiển thị</span>
              <input
                type="number"
                min={0}
                className="h-11 w-full rounded-lg border border-border px-3 py-2 lg:h-auto"
                value={form.sortOrder}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, sortOrder: Number(event.target.value) }))
                }
              />
              <span className="mt-1 block text-xs text-muted-foreground">
                Nếu chọn số đã có, hai câu chuyện sẽ tự đổi chỗ khi Lưu.
              </span>
            </label>
          </div>

          <label className="block text-sm">
            <span className="mb-1 block font-semibold text-foreground">Nội dung</span>
            <textarea
              className="min-h-28 w-full rounded-lg border border-border px-3 py-2"
              value={form.text}
              onChange={(event) => setForm((prev) => ({ ...prev, text: event.target.value }))}
            />
          </label>

          <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
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
            <Button type="button" disabled={saving} onClick={() => void handleSave()}>
              {saving ? "Đang lưu..." : "Lưu"}
            </Button>
            <Button type="button" variant="outline" onClick={closeForm}>
              Hủy
            </Button>
          </div>
        </div>
      ) : null}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Xóa câu chuyện?"
        description={
          deleteTarget
            ? `Bạn chắc muốn xóa câu chuyện của “${deleteTarget.name}”?`
            : ""
        }
        busy={deleting}
        onCancel={() => {
          if (!deleting) setDeleteTarget(null);
        }}
        onConfirm={() => void handleDelete()}
      />

      <ConfirmDialog
        open={bulk.confirmOpen}
        title="Xóa các mục đã chọn?"
        description={`Bạn chắc muốn xóa ${bulk.count} câu chuyện đã chọn? Thao tác này không hoàn tác được.`}
        busy={bulk.busy}
        onCancel={() => {
          if (!bulk.busy) bulk.closeConfirm();
        }}
        onConfirm={() => void handleBulkDelete()}
      />
    </div>
  );
}
