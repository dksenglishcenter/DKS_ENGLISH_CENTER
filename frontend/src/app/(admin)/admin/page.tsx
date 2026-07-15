import Link from "next/link";

import { PAGE_PATHS } from "@/lib/navigation-paths";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata = createPageMetadata({
  title: "Admin",
  description: "Bảng quản trị DKS English Center.",
  path: "/admin",
  noIndex: true,
});

const CARDS = [
  {
    title: "Liên hệ",
    desc: "Xem và xử lý đơn tư vấn từ trang Contact.",
    href: `${PAGE_PATHS.admin}/contacts`,
  },
  {
    title: "Tuyển dụng",
    desc: "Quản lý đơn ứng tuyển từ trang Careers.",
    href: `${PAGE_PATHS.admin}/careers`,
  },
  {
    title: "Media",
    desc: "Upload / quản lý ảnh Cloudinary.",
    href: `${PAGE_PATHS.admin}/media`,
  },
  {
    title: "Người dùng",
    desc: "Danh sách tài khoản USER / ADMIN.",
    href: `${PAGE_PATHS.admin}/users`,
  },
] as const;

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-[#4A2306] font-[family-name:var(--font-nunito)]">
          Tổng quan
        </h2>
        <p className="mt-1 text-sm text-[#9B6B50]">
          Khung trang admin đã sẵn sàng. Các module CRUD sẽ được nối API ở bước tiếp theo.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {CARDS.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="rounded-2xl border border-border bg-white p-5 transition-shadow hover:shadow-md"
          >
            <h3 className="font-black text-[#4A2306] font-[family-name:var(--font-nunito)]">
              {card.title}
            </h3>
            <p className="mt-2 text-sm text-[#9B6B50]">{card.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
