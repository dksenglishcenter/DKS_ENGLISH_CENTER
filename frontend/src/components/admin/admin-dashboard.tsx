"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Briefcase,
  Mail,
  Users,
  type LucideIcon,
} from "lucide-react";

import { getAdminDashboardStats } from "@/lib/dashboard/api";
import type { AdminDashboardStats } from "@/lib/dashboard/types";
import { formatError } from "@/lib/errors/format-error";
import { PAGE_PATHS } from "@/lib/navigation-paths";

// ---- Small building blocks ----

type Kpi = {
  title: string;
  value: number | string;
  hint: string;
  href: string;
  icon: LucideIcon;
};

function KpiTile({ kpi }: { kpi: Kpi }) {
  const Icon = kpi.icon;
  return (
    <Link
      href={kpi.href}
      className="rounded-2xl border border-border bg-white p-5 transition-shadow hover:shadow-md"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-[#9B6B50]">{kpi.title}</p>
        <span className="flex size-9 items-center justify-center rounded-xl bg-secondary text-primary">
          <Icon className="size-4" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-3 text-3xl font-black tracking-tight text-[#4A2306] font-[family-name:var(--font-nunito)]">
        {kpi.value}
      </p>
      <p className="mt-1 text-xs text-[#9B6B50]">{kpi.hint}</p>
    </Link>
  );
}

type BarItem = { label: string; value: number; href: string };

// Horizontal bar for magnitude comparison. Length = value, label always shown.
function BarRow({ item, max }: { item: BarItem; max: number }) {
  const pct = max > 0 ? Math.round((item.value / max) * 100) : 0;
  return (
    <Link
      href={item.href}
      className="group grid grid-cols-[130px_1fr_2rem] items-center gap-3 py-1.5"
      title={`${item.label}: ${item.value}`}
    >
      <span className="truncate text-sm text-[#4A2306] group-hover:text-primary">
        {item.label}
      </span>
      <span className="h-2.5 w-full overflow-hidden rounded-full bg-[#FDEBE0]">
        <span
          className="block h-full rounded-full bg-gradient-to-r from-primary to-accent"
          style={{ width: `${Math.max(pct, item.value > 0 ? 6 : 0)}%` }}
        />
      </span>
      <span className="text-right text-sm font-bold tabular-nums text-[#4A2306]">
        {item.value}
      </span>
    </Link>
  );
}

// Published vs draft, as a 2-segment stacked bar with a small surface gap.
function PublishBar({
  label,
  published,
  draft,
}: {
  label: string;
  published: number;
  draft: number;
}) {
  const total = published + draft;
  const pubPct = total > 0 ? (published / total) * 100 : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-[#4A2306]">{label}</span>
        <span className="text-xs text-[#9B6B50]">
          {published}/{total} xuất bản
        </span>
      </div>
      <div className="flex h-2.5 w-full gap-0.5 overflow-hidden rounded-full bg-[#FDEBE0]">
        <span
          className="h-full rounded-full bg-primary"
          style={{ width: `${pubPct}%` }}
        />
        {draft > 0 ? (
          <span
            className="h-full rounded-full bg-[#D9BCA9]"
            style={{ width: `${100 - pubPct}%` }}
          />
        ) : null}
      </div>
    </div>
  );
}

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-white p-5">
      <h3 className="mb-4 text-base font-bold text-[#4A2306]">{title}</h3>
      {children}
    </section>
  );
}

// ---- Dashboard ----

export function AdminDashboard() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getAdminDashboardStats();
        if (!cancelled) setStats(response.stats);
      } catch (err) {
        if (!cancelled) setError(formatError(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-[#4A2306] font-[family-name:var(--font-nunito)]">
          Tổng quan
        </h2>
        <p className="mt-1 text-sm text-[#9B6B50]">
          Thống kê nội dung và đơn gửi từ toàn bộ website.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-[#9B6B50]">Đang tải thống kê…</p>
      ) : null}

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {stats ? <DashboardContent stats={stats} /> : null}
    </div>
  );
}

function DashboardContent({ stats }: { stats: AdminDashboardStats }) {
  const admin = PAGE_PATHS.admin;

  const contentTotal =
    stats.courses.total +
    stats.blog.total +
    stats.teachers.total +
    stats.successStories.total +
    stats.gallery.total +
    stats.facilities.total;

  const kpis: Kpi[] = [
    {
      title: "Tổng nội dung",
      value: contentTotal,
      hint: "Khóa học, blog, giáo viên…",
      href: `${admin}/courses`,
      icon: BookOpen,
    },
    {
      title: "Liên hệ mới",
      value: stats.contacts.last7Days,
      hint: `${stats.contacts.total} tổng · 7 ngày qua`,
      href: `${admin}/contacts`,
      icon: Mail,
    },
    {
      title: "Ứng tuyển mới",
      value: stats.careers.last7Days,
      hint: `${stats.careers.total} tổng · 7 ngày qua`,
      href: `${admin}/careers`,
      icon: Briefcase,
    },
    {
      title: "Người dùng",
      value: stats.users.total,
      hint: `${stats.users.admins} admin · ${stats.users.members} user`,
      href: `${admin}/users`,
      icon: Users,
    },
  ];

  // Bar chart: content counts by type, sorted descending.
  const contentBars: BarItem[] = [
    { label: "Khóa học", value: stats.courses.total, href: `${admin}/courses` },
    { label: "Blog", value: stats.blog.total, href: `${admin}/blog` },
    {
      label: "Giáo viên",
      value: stats.teachers.total,
      href: `${admin}/teachers`,
    },
    {
      label: "Câu chuyện",
      value: stats.successStories.total,
      href: `${admin}/success-stories`,
    },
    {
      label: "Môi trường học tập",
      value: stats.gallery.total,
      href: `${admin}/gallery`,
    },
    {
      label: "Cơ sở vật chất",
      value: stats.facilities.total,
      href: `${admin}/about`,
    },
  ].sort((a, b) => b.value - a.value);

  const maxBar = Math.max(...contentBars.map((item) => item.value), 1);

  return (
    <div className="space-y-6">
      {/* KPI row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <KpiTile key={kpi.title} kpi={kpi} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
        <Card title="Nội dung theo loại">
          <div className="divide-y divide-[#F5E7DC]">
            {contentBars.map((item) => (
              <BarRow key={item.label} item={item} max={maxBar} />
            ))}
          </div>
        </Card>

        <Card title="Trạng thái xuất bản">
          <div className="space-y-4">
            <PublishBar
              label="Khóa học"
              published={stats.courses.published}
              draft={stats.courses.draft}
            />
            <PublishBar
              label="Blog"
              published={stats.blog.published}
              draft={stats.blog.draft}
            />
            {/* Legend — required for the 2-series stacked bar */}
            <div className="flex items-center gap-4 pt-1 text-xs text-[#9B6B50]">
              <span className="flex items-center gap-1.5">
                <span className="size-3 rounded-sm bg-primary" />
                Đã xuất bản
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-3 rounded-sm bg-[#D9BCA9]" />
                Nháp
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
