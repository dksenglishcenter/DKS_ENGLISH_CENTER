"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ClipboardCheck, LogOut, Wallet } from "lucide-react";

import { DKSLogo } from "@/components/brand/dks-logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { getCurrentUser, logoutUser } from "@/lib/auth/api";
import type { AuthUser } from "@/lib/auth/types";
import { formatAdminDate } from "@/lib/admin/format";
import { formatError } from "@/lib/errors/format-error";
import { PAGE_PATHS } from "@/lib/navigation-paths";
import {
  getParentChildAttendance,
  listParentChildren,
  listParentInvoices,
  listParentReminders,
  reportTransfer,
} from "@/lib/ops/api";
import type {
  AttendanceRate,
  AttendanceRecord,
  BankDetails,
  InvoiceStatus,
  Student,
  TuitionInvoice,
} from "@/lib/ops/types";

const STATUS_LABEL: Record<InvoiceStatus, string> = {
  UNPAID: "Chưa đóng",
  PENDING: "Chờ xác nhận",
  PAID: "Đã nhận",
};

const ATTEND_LABEL = {
  PRESENT: "Có mặt",
  ABSENT: "Vắng",
  LATE: "Muộn",
} as const;

function money(value: number) {
  return `${new Intl.NumberFormat("vi-VN").format(value)} ₫`;
}

export function ParentPortal() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [checking, setChecking] = useState(true);
  const [tab, setTab] = useState<"attendance" | "tuition">("attendance");
  const [children, setChildren] = useState<Student[]>([]);
  const [childId, setChildId] = useState("");
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [rate, setRate] = useState<AttendanceRate | null>(null);
  const [invoices, setInvoices] = useState<TuitionInvoice[]>([]);
  const [reminders, setReminders] = useState<TuitionInvoice[]>([]);
  const [bank, setBank] = useState<BankDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const response = await getCurrentUser();
        if (cancelled) return;
        if (response.user.role !== "PARENT") {
          router.replace(PAGE_PATHS.home);
          return;
        }
        setUser(response.user);
      } catch {
        if (!cancelled) router.replace(PAGE_PATHS.login);
      } finally {
        if (!cancelled) setChecking(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  useEffect(() => {
    if (!user) return;
    void listParentChildren()
      .then((response) => {
        setChildren(response.data);
        if (response.data[0]) setChildId(response.data[0].id);
      })
      .catch((err) => setError(formatError(err)));
  }, [user]);

  useEffect(() => {
    if (!childId) return;
    void getParentChildAttendance(childId)
      .then((response) => {
        setRecords(response.data.records);
        setRate(response.data.rate);
      })
      .catch((err) => setError(formatError(err)));
  }, [childId]);

  useEffect(() => {
    if (!user || tab !== "tuition") return;
    void Promise.all([listParentInvoices(), listParentReminders()])
      .then(([invoiceRes, reminderRes]) => {
        setInvoices(invoiceRes.data);
        setBank(invoiceRes.bank);
        setReminders(reminderRes.data);
      })
      .catch((err) => setError(formatError(err)));
  }, [user, tab]);

  async function handleLogout() {
    await logoutUser();
    router.replace(PAGE_PATHS.login);
  }

  if (checking || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Đang kiểm tra phiên đăng nhập...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF9F5] dark:bg-background">
      <header className="border-b border-border bg-white px-4 py-3 dark:bg-card">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <DKSLogo size="sm" />
            <div>
              <p className="text-sm font-black font-[family-name:var(--font-nunito)]">Cổng phụ huynh</p>
              <p className="text-xs text-muted-foreground">{user.fullName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href={PAGE_PATHS.home} className="text-sm font-semibold text-primary">
              Website
            </Link>
            <Button type="button" variant="outline" size="sm" onClick={() => void handleLogout()}>
              <LogOut className="size-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-5 p-4 pb-24">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            className={`flex h-12 items-center justify-center gap-2 rounded-xl text-sm font-bold ${
              tab === "attendance" ? "bg-primary text-white" : "bg-card border border-border"
            }`}
            onClick={() => setTab("attendance")}
          >
            <ClipboardCheck className="size-4" />
            Điểm danh
          </button>
          <button
            type="button"
            className={`flex h-12 items-center justify-center gap-2 rounded-xl text-sm font-bold ${
              tab === "tuition" ? "bg-primary text-white" : "bg-card border border-border"
            }`}
            onClick={() => setTab("tuition")}
          >
            <Wallet className="size-4" />
            Học phí
          </button>
        </div>

        {notice ? (
          <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {notice}
          </p>
        ) : null}
        {error ? (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
        ) : null}

        {tab === "attendance" ? (
          <section className="space-y-4">
            <label className="block text-sm">
              <span className="mb-1 block font-semibold">Chọn con</span>
              <select
                className="h-12 w-full rounded-xl border border-border bg-card px-3 font-semibold"
                value={childId}
                onChange={(event) => setChildId(event.target.value)}
              >
                {children.length === 0 ? <option value="">Chưa liên kết học viên</option> : null}
                {children.map((child) => (
                  <option key={child.id} value={child.id}>
                    {child.fullName}
                  </option>
                ))}
              </select>
            </label>
            {rate ? (
              <div className="rounded-2xl border border-border bg-card p-4">
                <p className="text-sm text-muted-foreground">Tỷ lệ đi học</p>
                <p className="text-3xl font-black">{rate.percent}%</p>
                <p className="text-xs text-muted-foreground">
                  {rate.present} có mặt · {rate.late} muộn · {rate.absent} vắng / {rate.total} buổi
                </p>
              </div>
            ) : null}
            <ul className="space-y-2">
              {records.map((record) => (
                <li key={record.id} className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3 text-sm">
                  <div>
                    <p className="font-semibold">{record.date ? formatAdminDate(record.date) : "—"}</p>
                    <p className="text-xs text-muted-foreground">{record.class?.name}</p>
                  </div>
                  <span className="font-bold">{ATTEND_LABEL[record.status as keyof typeof ATTEND_LABEL]}</span>
                </li>
              ))}
            </ul>
          </section>
        ) : (
          <section className="space-y-4">
            {reminders.length > 0 ? (
              <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
                Có {reminders.length} khoản sắp hạn / quá hạn.
              </div>
            ) : null}
            {bank ? (
              <div className="rounded-2xl border border-border bg-card p-4 text-sm">
                <p className="font-bold">Chuyển khoản</p>
                <p>{bank.bankName}</p>
                <p>{bank.accountName}</p>
                <p className="font-black tracking-wide">{bank.accountNumber}</p>
                <p className="text-muted-foreground">{bank.note}</p>
              </div>
            ) : null}
            <ul className="space-y-3">
              {invoices.map((invoice) => (
                <li key={invoice.id} className="rounded-2xl border border-border bg-card p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-bold">{invoice.student?.fullName}</p>
                      <p className="text-sm text-muted-foreground">
                        {invoice.period} · hạn {formatAdminDate(invoice.dueDate)}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-bold ${
                        invoice.status !== "PAID" &&
                        new Date(invoice.dueDate) < new Date()
                          ? "bg-red-100 text-red-700"
                          : "bg-secondary"
                      }`}
                    >
                      {invoice.status !== "PAID" &&
                      new Date(invoice.dueDate) < new Date()
                        ? "Quá hạn"
                        : STATUS_LABEL[invoice.status]}
                    </span>
                  </div>
                  <p className="mt-2 text-lg font-black">{money(invoice.amount)}</p>
                  {invoice.status === "UNPAID" ? (
                    <Button
                      type="button"
                      className="mt-3 w-full"
                      disabled={busy}
                      onClick={() => {
                        setBusy(true);
                        void reportTransfer(invoice.id)
                          .then((response) => {
                            setNotice(response.message);
                            setTab("tuition");
                            return listParentInvoices();
                          })
                          .then((response) => {
                            if (response) setInvoices(response.data);
                          })
                          .catch((err) => setError(formatError(err)))
                          .finally(() => setBusy(false));
                      }}
                    >
                      Đã chuyển khoản
                    </Button>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </div>
  );
}
