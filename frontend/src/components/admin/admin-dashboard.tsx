"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { getAdminDashboardStats } from "@/lib/dashboard/api";
import type { AdminDashboardStats } from "@/lib/dashboard/types";
import { formatError } from "@/lib/errors/format-error";
import { PAGE_PATHS } from "@/lib/navigation-paths";

type StatCard = {
  title: string;
  href: string;
  value: string | number;
  details: string[];
};

function buildCards(stats: AdminDashboardStats): StatCard[] {
  return [
    {
      title: "Khóa học",
      href: `${PAGE_PATHS.admin}/courses`,
      value: stats.courses.total,
      details: [
        `${stats.courses.published} đã xuất bản`,
        `${stats.courses.featured} nổi bật`,
        `${stats.courses.draft} nháp`,
      ],
    },
    {
      title: "Câu chuyện thành công",
      href: `${PAGE_PATHS.admin}/success-stories`,
      value: stats.successStories.total,
      details: [`${stats.successStories.published} đang hiển thị`],
    },
    {
      title: "Môi trường học tập",
      href: `${PAGE_PATHS.admin}/gallery`,
      value: `${stats.gallery.total}/${stats.gallery.max}`,
      details: [`${stats.gallery.published} đã xuất bản`],
    },
    {
      title: "Về chúng tôi",
      href: `${PAGE_PATHS.admin}/about`,
      value: `${stats.facilities.total}/${stats.facilities.max}`,
      details: [
        `Cơ sở vật chất: ${stats.facilities.published} xuất bản`,
        stats.about.hasVisionImage
          ? "Đã có ảnh tầm nhìn"
          : "Chưa có ảnh tầm nhìn",
      ],
    },
    {
      title: "Giáo viên",
      href: `${PAGE_PATHS.admin}/teachers`,
      value: stats.teachers.total,
      details: [`${stats.teachers.published} đang hiển thị`],
    },
    {
      title: "Blog",
      href: `${PAGE_PATHS.admin}/blog`,
      value: "—",
      details: ["Chưa nối API — để trống cho dev khác"],
    },
    {
      title: "Liên hệ",
      href: `${PAGE_PATHS.admin}/contacts`,
      value: stats.contacts.total,
      details: [`${stats.contacts.last7Days} trong 7 ngày`],
    },
    {
      title: "Tuyển dụng",
      href: `${PAGE_PATHS.admin}/careers`,
      value: stats.careers.total,
      details: [`${stats.careers.last7Days} trong 7 ngày`],
    },
    {
      title: "Người dùng",
      href: `${PAGE_PATHS.admin}/users`,
      value: stats.users.total,
      details: [
        `${stats.users.admins} admin`,
        `${stats.users.members} user`,
      ],
    },
  ];
}

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

      {stats ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {buildCards(stats).map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="rounded-2xl border border-border bg-white p-5 transition-shadow hover:shadow-md"
            >
              <p className="text-sm font-semibold text-[#9B6B50]">{card.title}</p>
              <p className="mt-2 text-3xl font-black tracking-tight text-[#4A2306] font-[family-name:var(--font-nunito)]">
                {card.value}
              </p>
              <ul className="mt-3 space-y-1 text-xs text-[#9B6B50]">
                {card.details.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
