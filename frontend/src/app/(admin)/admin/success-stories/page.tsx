import { SuccessStoriesAdmin } from "@/components/admin/success-stories-admin";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata = createPageMetadata({
  title: "Admin · Câu chuyện thành công",
  description: "Quản lý testimonials trang chủ DKS.",
  path: "/admin/success-stories",
  noIndex: true,
});

export default function AdminSuccessStoriesPage() {
  return <SuccessStoriesAdmin />;
}
