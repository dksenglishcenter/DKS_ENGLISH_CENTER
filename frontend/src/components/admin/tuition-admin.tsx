"use client";

import { useEffect, useState, type FormEvent } from "react";

import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatAdminDate } from "@/lib/admin/format";
import { formatError } from "@/lib/errors/format-error";
import {
  createInvoice,
  deleteInvoice,
  listInvoices,
  listStudents,
  markInvoicePaid,
} from "@/lib/ops/api";
import type { InvoiceStatus, ListMeta, Student, TuitionInvoice } from "@/lib/ops/types";

const FILTER_CONTROL =
  "h-11 rounded-lg border border-border bg-card px-4 text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-primary";

const STATUS_LABEL: Record<InvoiceStatus, string> = {
  UNPAID: "Chưa đóng",
  PENDING: "Chờ xác nhận",
  PAID: "Đã nhận",
};

function money(value: number) {
  return `${new Intl.NumberFormat("vi-VN").format(value)} ₫`;
}

export function TuitionAdmin() {
  const [items, setItems] = useState<TuitionInvoice[]>([]);
  const [meta, setMeta] = useState<ListMeta | null>(null);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<"" | InvoiceStatus>("");
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<TuitionInvoice | null>(null);
  const [form, setForm] = useState({
    studentId: "",
    period: new Date().toISOString().slice(0, 7),
    amount: "1200000",
    dueDate: "",
    note: "",
  });

  useEffect(() => {
    listStudents({ pageSize: 100, status: "STUDYING" })
      .then((response) => setStudents(response.data))
      .catch(() => setStudents([]));
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    listInvoices({ page, status, signal: controller.signal })
      .then((response) => {
        setItems(response.data);
        setMeta(response.meta);
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(formatError(err));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [page, status, reloadKey]);

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const response = await createInvoice({
        studentId: form.studentId,
        period: form.period,
        amount: Number(form.amount),
        dueDate: form.dueDate,
        note: form.note.trim() || null,
      });
      setNotice(response.message);
      setFormOpen(false);
      setReloadKey((value) => value + 1);
    } catch (err) {
      setError(formatError(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-black font-[family-name:var(--font-nunito)]">Học phí</h2>
          <p className="text-sm text-muted-foreground">Tạo khoản tháng và xác nhận đã nhận.</p>
        </div>
        <Button type="button" onClick={() => setFormOpen(true)}>
          Tạo khoản tháng
        </Button>
      </div>

      {notice ? (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {notice}
        </p>
      ) : null}
      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      ) : null}

      <select
        className={FILTER_CONTROL}
        value={status}
        onChange={(event) => {
          setStatus(event.target.value as "" | InvoiceStatus);
          setPage(1);
        }}
      >
        <option value="">Tất cả trạng thái</option>
        <option value="UNPAID">Chưa đóng</option>
        <option value="PENDING">Chờ xác nhận</option>
        <option value="PAID">Đã nhận</option>
      </select>

      {formOpen ? (
        <form onSubmit={handleCreate} className="grid gap-4 rounded-2xl border border-border bg-card p-5 md:grid-cols-2">
          <h3 className="font-black md:col-span-2">Khoản học phí mới</h3>
          <label className="text-sm">
            <span className="mb-1 block font-semibold">Học viên</span>
            <select
              required
              className={`h-12 w-full ${FILTER_CONTROL}`}
              value={form.studentId}
              onChange={(event) => setForm({ ...form, studentId: event.target.value })}
            >
              <option value="">Chọn học viên</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.fullName}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-semibold">Kỳ (tháng)</span>
            <Input
              type="month"
              required
              value={form.period}
              onChange={(event) => setForm({ ...form, period: event.target.value })}
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-semibold">Số tiền</span>
            <Input
              type="number"
              min={0}
              required
              value={form.amount}
              onChange={(event) => setForm({ ...form, amount: event.target.value })}
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-semibold">Hạn đóng</span>
            <Input
              type="date"
              required
              value={form.dueDate}
              onChange={(event) => setForm({ ...form, dueDate: event.target.value })}
            />
          </label>
          <label className="text-sm md:col-span-2">
            <span className="mb-1 block font-semibold">Ghi chú</span>
            <Input value={form.note} onChange={(event) => setForm({ ...form, note: event.target.value })} />
          </label>
          <div className="flex justify-end gap-2 md:col-span-2">
            <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
              Hủy
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Đang tạo..." : "Tạo khoản"}
            </Button>
          </div>
        </form>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        {loading ? (
          <p className="p-8 text-center text-sm text-muted-foreground">Đang tải...</p>
        ) : items.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">Chưa có khoản học phí.</p>
        ) : (
          <ul className="divide-y divide-border">
            {items.map((invoice) => (
              <li key={invoice.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-bold">{invoice.student?.fullName ?? invoice.studentId}</p>
                  <p className="text-sm text-muted-foreground">
                    {invoice.period} · {money(invoice.amount)} · hạn {formatAdminDate(invoice.dueDate)} ·{" "}
                    {STATUS_LABEL[invoice.status]}
                  </p>
                </div>
                <div className="flex gap-2">
                  {invoice.status !== "PAID" ? (
                    <Button
                      type="button"
                      size="sm"
                      onClick={() =>
                        void markInvoicePaid(invoice.id)
                          .then((response) => {
                            setNotice(response.message);
                            setReloadKey((value) => value + 1);
                          })
                          .catch((err) => setError(formatError(err)))
                      }
                    >
                      Đã nhận
                    </Button>
                  ) : null}
                  <Button type="button" size="sm" variant="outline" onClick={() => setDeleteTarget(invoice)}>
                    Xóa
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {meta && meta.totalPages > 1 ? (
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((v) => v - 1)}>
            Trước
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= meta.totalPages}
            onClick={() => setPage((v) => v + 1)}
          >
            Sau
          </Button>
        </div>
      ) : null}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Xóa khoản học phí?"
        description="Thao tác này không hoàn tác."
        onConfirm={() => {
          if (!deleteTarget) return;
          void deleteInvoice(deleteTarget.id)
            .then((response) => {
              setNotice(response.message);
              setDeleteTarget(null);
              setReloadKey((v) => v + 1);
            })
            .catch((err) => setError(formatError(err)));
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
