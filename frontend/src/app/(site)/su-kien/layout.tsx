import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata = createPageMetadata({
  title: "Sự kiện",
  description:
    "Thông báo sự kiện và lưu trữ hình ảnh hoạt động tại DKS English Center — học tập, giao lưu, ngày hội.",
  path: "/su-kien",
});

export default function EventsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
