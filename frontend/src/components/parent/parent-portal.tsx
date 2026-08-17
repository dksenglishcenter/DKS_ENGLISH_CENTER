"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ClipboardCheck, LogOut, Wallet } from "lucide-react";

import { DKSLogo } from "@/components/brand/dks-logo";
import { PaymentProofViewer } from "@/components/media/payment-proof-viewer";
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
import { formatScheduleDays } from "@/lib/ops/class-schedule";
import type {
  AttendanceRate,
  AttendanceStatus,
  BankDetails,
  InvoiceStatus,
  ParentClassAttendance,
  ParentClassSession,
  Student,
  TuitionInvoice,
} from "@/lib/ops/types";

const STATUS_LABEL: Record<InvoiceStatus, string> = {
  UNPAID: "Chưa đóng",
  PENDING: "Chờ xác nhận",
  PAID: "Đã nhận",
};

const ATTEND_LABEL: Record<AttendanceStatus, string> = {
  PRESENT: "Có mặt",
  ABSENT: "Vắng",
  LATE: "Muộn",
};

const SESSION_KIND_LABEL: Record<ParentClassSession["kind"], string> = {
  marked: "",
  opened: "Chưa điểm danh",
  upcoming: "Sắp tới",
  planned: "Chưa mở buổi",
};

function sessionStatusLabel(session: ParentClassSession) {
  if (session.status) return ATTEND_LABEL[session.status];
  return SESSION_KIND_LABEL[session.kind];
}

function sessionStatusClass(session: ParentClassSession) {
  if (session.status === "PRESENT") return "bg-emerald-100 text-emerald-800";
  if (session.status === "LATE") return "bg-amber-100 text-amber-800";
  if (session.status === "ABSENT") return "bg-red-100 text-red-800";
  if (session.kind === "upcoming") return "bg-sky-100 text-sky-800";
  if (session.kind === "opened") return "bg-secondary text-foreground";
  return "bg-muted text-muted-foreground";
}

function money(value: number) {
  return `${new Intl.NumberFormat("vi-VN").format(value)} ₫`;
}

function formatPeriod(startsOn: string | null, endsOn: string | null) {
  if (startsOn && endsOn) {
    return `${formatAdminDate(startsOn)} → ${formatAdminDate(endsOn)}`;
  }
  if (startsOn) return `Từ ${formatAdminDate(startsOn)}`;
  if (endsOn) return `Đến ${formatAdminDate(endsOn)}`;
  return "Chưa set ngày bắt đầu / kết thúc khóa";
}

function formatClassTime(startTime: string | null, endTime: string | null) {
  if (startTime && endTime) return `${startTime} – ${endTime}`;
  if (startTime) return `Từ ${startTime}`;
  if (endTime) return `Đến ${endTime}`;
  return null;
}

export function ParentPortal() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [checking, setChecking] = useState(true);
  const [tab, setTab] = useState<"attendance" | "tuition">("attendance");
  const [children, setChildren] = useState<Student[]>([]);
  const [childId, setChildId] = useState("");
  const [classes, setClasses] = useState<ParentClassAttendance[]>([]);
  const [rate, setRate] = useState<AttendanceRate | null>(null);
  const [invoices, setInvoices] = useState<TuitionInvoice[]>([]);
  const [reminders, setReminders] = useState<TuitionInvoice[]>([]);
  const [bank, setBank] = useState<BankDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [proofFiles, setProofFiles] = useState<
    Record<string, { file: File; preview: string }>
  >({});

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
        setClasses(response.data.classes ?? []);
        setRate(response.data.rate ?? null);
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

  const selectedChild = children.find((child) => child.id === childId);
  const childEnrollments = selectedChild?.enrollments ?? [];

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
                    {(child.enrollments?.length ?? 0) > 0
                      ? ` · ${child.enrollments!.map((item) => item.class.name).join(", ")}`
                      : ""}
                  </option>
                ))}
              </select>
            </label>
            {childEnrollments.length > 0 ? (
              <p className="text-sm text-muted-foreground">
                Đang học: {childEnrollments.map((item) => item.class.name).join(", ")}
              </p>
            ) : null}
            {rate ? (
              <div className="rounded-2xl border border-border bg-card p-4">
                <p className="text-sm text-muted-foreground">Tỷ lệ đi học (toàn bộ lớp)</p>
                <p className="text-3xl font-black">{rate.percent}%</p>
                <p className="text-xs text-muted-foreground">
                  {rate.present} có mặt · {rate.late} muộn · {rate.absent} vắng / {rate.total} buổi đã điểm danh
                </p>
              </div>
            ) : null}
            {(classes ?? []).length === 0 ? (
              <p className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
                {childEnrollments.length > 0
                  ? `Học viên đang ở lớp ${childEnrollments.map((item) => item.class.name).join(", ")}. Đang tải lịch buổi — nếu vẫn trống, restart backend rồi F5.`
                  : "Học viên chưa được xếp vào lớp nào. Vào Admin → Lớp học → Học viên để thêm."}
              </p>
            ) : (
              (classes ?? []).map((item) => {
                const timeLabel = formatClassTime(item.startTime, item.endTime);
                return (
                  <article key={item.id} className="space-y-3 rounded-2xl border border-border bg-card p-4">
                    <div>
                      <h3 className="text-lg font-black font-[family-name:var(--font-nunito)]">
                        {item.name}
                      </h3>
                      {item.course ? (
                        <p className="text-sm text-muted-foreground">Khóa: {item.course.title}</p>
                      ) : null}
                      <p className="mt-1 text-sm font-semibold">
                        Thời gian khóa: {formatPeriod(item.startsOn, item.endsOn)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Lịch: {formatScheduleDays(item.scheduleDays)}
                        {timeLabel ? ` · ${timeLabel}` : ""}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Đã điểm danh: {item.rate.present} có mặt · {item.rate.late} muộn ·{" "}
                        {item.rate.absent} vắng / {item.rate.total} buổi ({item.rate.percent}%)
                      </p>
                    </div>
                    {item.sessions.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        Chưa có buổi nào. Admin hãy set ngày bắt đầu/kết thúc khóa hoặc mở điểm danh.
                      </p>
                    ) : (
                      <ul className="space-y-2">
                        {item.sessions.map((session) => (
                          <li
                            key={`${item.id}-${session.date}`}
                            className="flex items-center justify-between gap-3 rounded-xl border border-border px-3 py-2.5 text-sm"
                          >
                            <div>
                              <p className="font-semibold">{formatAdminDate(session.date)}</p>
                              {session.note ? (
                                <p className="text-xs text-muted-foreground">{session.note}</p>
                              ) : null}
                            </div>
                            <span
                              className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${sessionStatusClass(session)}`}
                            >
                              {sessionStatusLabel(session)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </article>
                );
              })
            )}
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
                  {invoice.paymentProofUrl ? (
                    <PaymentProofViewer
                      url={invoice.paymentProofUrl}
                      label="Minh chứng đã gửi"
                    />
                  ) : null}
                  {invoice.status === "UNPAID" ||
                  (invoice.status === "PENDING" && !invoice.paymentProofUrl) ? (
                    <div className="mt-3 space-y-2">
                      {!invoice.paymentProofUrl && invoice.status === "PENDING" ? (
                        <p className="text-xs text-amber-700">
                          Lần trước chưa lưu được ảnh — vui lòng gửi lại minh chứng.
                        </p>
                      ) : null}
                      <label className="block text-sm">
                        <span className="mb-1 block font-semibold">Minh chứng chuyển khoản *</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-secondary file:px-3 file:py-2 file:font-semibold"
                          onChange={(event) => {
                            const file = event.target.files?.[0];
                            setProofFiles((current) => {
                              const previous = current[invoice.id];
                              if (previous) URL.revokeObjectURL(previous.preview);
                              if (!file) {
                                const next = { ...current };
                                delete next[invoice.id];
                                return next;
                              }
                              return {
                                ...current,
                                [invoice.id]: {
                                  file,
                                  preview: URL.createObjectURL(file),
                                },
                              };
                            });
                          }}
                        />
                      </label>
                      {proofFiles[invoice.id] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={proofFiles[invoice.id].preview}
                          alt="Minh chứng chuyển khoản"
                          className="max-h-40 rounded-xl border border-border object-contain"
                        />
                      ) : null}
                      <Button
                        type="button"
                        className="w-full"
                        disabled={busy || !proofFiles[invoice.id]}
                        onClick={() => {
                          const selected = proofFiles[invoice.id];
                          if (!selected) {
                            setError("Vui lòng chọn ảnh minh chứng chuyển khoản.");
                            return;
                          }
                          setBusy(true);
                          setError(null);
                          void reportTransfer(invoice.id, selected.file)
                            .then((response) => {
                              setNotice(response.message);
                              URL.revokeObjectURL(selected.preview);
                              setProofFiles((current) => {
                                const next = { ...current };
                                delete next[invoice.id];
                                return next;
                              });
                              return listParentInvoices();
                            })
                            .then((response) => {
                              if (response) setInvoices(response.data);
                            })
                            .catch((err) => setError(formatError(err)))
                            .finally(() => setBusy(false));
                        }}
                      >
                        {busy
                          ? "Đang gửi..."
                          : invoice.status === "PENDING"
                            ? "Gửi lại minh chứng"
                            : "Đã chuyển khoản"}
                      </Button>
                    </div>
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
