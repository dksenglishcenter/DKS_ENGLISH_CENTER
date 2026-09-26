"use client";

import { useCallback, useState } from "react";

import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { EventPhotosAdmin } from "@/components/admin/event-photos-admin";
import { RowActions } from "@/components/admin/row-actions";
import { Button } from "@/components/ui/button";
import { useAdminResourceList } from "@/hooks/use-admin-resource-list";
import { nextSortOrder } from "@/lib/admin/sort-order";
import { formatError } from "@/lib/errors/format-error";
import {
  createEvent,
  deleteEvent,
  listEvents,
  updateEvent,
} from "@/lib/events/api";
import type { EventItem, EventPayload } from "@/lib/events/types";

const EMPTY_FORM: EventPayload = {
  title: "",
  summary: "",
  body: "",
  eventDate: "",
  coverImageUrl: "",
  sortOrder: 0,
  isPublished: true,
};

export function EventsAdmin() {
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [form, setForm] = useState<EventPayload>(EMPTY_FORM);

  const loadItems = useCallback(async () => {
    const response = await listEvents({ publishedOnly: false });
    return response.events;
  }, []);

  const {
    items: events,
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
  } = useAdminResourceList<EventItem>({ loadItems });

  const openCreate = () => {
    setForm({
      ...EMPTY_FORM,
      sortOrder: nextSortOrder(events.map((e) => e.sortOrder)),
    });
    setFormError(null);
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (event: EventItem) => {
    setForm({
      title: event.title,
      summary: event.summary,
      body: event.body ?? "",
      eventDate: event.eventDate ? event.eventDate.slice(0, 10) : "",
      coverImageUrl: event.coverImageUrl ?? "",
      sortOrder: event.sortOrder,
      isPublished: event.isPublished,
    });
    setFormError(null);
    setEditingId(event.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.title.trim() || form.summary.trim().length < 10) {
      setFormError("Tiêu đề và tóm tắt (≥10 ký tự) là bắt buộc.");
      return;
    }

    setSaving(true);
    setFormError(null);
    try {
      const payload: EventPayload = {
        title: form.title.trim(),
        summary: form.summary.trim(),
        body: form.body?.trim() || undefined,
        eventDate: form.eventDate?.trim() || null,
        coverImageUrl: form.coverImageUrl?.trim() || null,
        sortOrder: form.sortOrder ?? 0,
        isPublished: form.isPublished ?? true,
      };
      if (editingId) await updateEvent(editingId, payload);
      else await createEvent(payload);
      resetFormChrome();
      setForm(EMPTY_FORM);
      await load();
    } catch (error) {
      setFormError(formatError(error));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteEvent(deleteTarget.id);
      setDeleteTarget(null);
      await load();
    } catch (error) {
      setListError(formatError(error));
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-foreground font-[family-name:var(--font-nunito)]">
            Sự kiện
          </h1>
          <p className="text-sm text-muted-foreground">
            Thông báo + album ảnh hoạt động trên trang /su-kien.
          </p>
        </div>
        <Button type="button" onClick={openCreate}>
          Thêm sự kiện
        </Button>
      </div>

      {listError ? <p className="text-sm text-red-600">{listError}</p> : null}
      {loading ? <p className="text-sm text-muted-foreground">Đang tải…</p> : null}

      {showForm ? (
        <div ref={formRef} className="space-y-4 rounded-2xl border border-border bg-card p-5">
          <h2 className="text-lg font-bold font-[family-name:var(--font-nunito)]">
            {editingId ? "Sửa sự kiện" : "Thêm sự kiện"}
          </h2>
          {formError ? <p className="text-sm text-red-600">{formError}</p> : null}
          <label className="block space-y-1 text-sm">
            <span className="font-semibold">Tiêu đề *</span>
            <input
              className="w-full rounded-lg border border-border bg-background px-3 py-2"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
          </label>
          <label className="block space-y-1 text-sm">
            <span className="font-semibold">Tóm tắt *</span>
            <textarea
              className="min-h-24 w-full rounded-lg border border-border bg-background px-3 py-2"
              value={form.summary}
              onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))}
            />
          </label>
          <label className="block space-y-1 text-sm">
            <span className="font-semibold">Nội dung chi tiết</span>
            <textarea
              className="min-h-28 w-full rounded-lg border border-border bg-background px-3 py-2"
              value={form.body ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-1 text-sm">
              <span className="font-semibold">Ngày sự kiện</span>
              <input
                type="date"
                className="w-full rounded-lg border border-border bg-background px-3 py-2"
                value={form.eventDate ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, eventDate: e.target.value }))}
              />
            </label>
            <label className="block space-y-1 text-sm">
              <span className="font-semibold">Thứ tự</span>
              <input
                type="number"
                className="w-full rounded-lg border border-border bg-background px-3 py-2"
                value={form.sortOrder ?? 0}
                onChange={(e) =>
                  setForm((f) => ({ ...f, sortOrder: Number(e.target.value) || 0 }))
                }
              />
            </label>
          </div>
          <label className="flex items-center gap-2 text-sm font-semibold">
            <input
              type="checkbox"
              checked={form.isPublished ?? true}
              onChange={(e) => setForm((f) => ({ ...f, isPublished: e.target.checked }))}
            />
            Công khai
          </label>
          <div className="flex gap-2">
            <Button type="button" disabled={saving} onClick={() => void handleSave()}>
              {saving ? "Đang lưu…" : "Lưu"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetFormChrome();
                setForm(EMPTY_FORM);
              }}
            >
              Hủy
            </Button>
          </div>
        </div>
      ) : null}

      <div className="overflow-x-auto rounded-2xl border border-border">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-secondary/60">
            <tr>
              <th className="px-4 py-3">Tiêu đề</th>
              <th className="px-4 py-3">Ngày</th>
              <th className="px-4 py-3">Thứ tự</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id} className="border-t border-border">
                <td className="px-4 py-3 font-semibold">{event.title}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {event.eventDate ? event.eventDate.slice(0, 10) : "—"}
                </td>
                <td className="px-4 py-3">{event.sortOrder}</td>
                <td className="px-4 py-3">
                  {event.isPublished ? "Công khai" : "Ẩn"}
                </td>
                <td className="px-4 py-3">
                  <RowActions
                    onEdit={() => openEdit(event)}
                    onDelete={() => setDeleteTarget(event)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Xóa sự kiện?"
        description={deleteTarget ? `Xóa “${deleteTarget.title}”?` : ""}
        confirmLabel={deleting ? "Đang xóa…" : "Xóa"}
        busy={deleting}
        onConfirm={() => void handleDelete()}
        onCancel={() => {
          if (!deleting) setDeleteTarget(null);
        }}
      />

      <div className="border-t border-border pt-8">
        <EventPhotosAdmin />
      </div>
    </div>
  );
}
