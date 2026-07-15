import { AboutAdmin } from "@/components/admin/about-admin";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata = createPageMetadata({
  title: "Admin · Về chúng tôi",
  description: "Quản lý nội dung trang About DKS.",
  path: "/admin/about",
  noIndex: true,
});

export default function AdminAboutPage() {
  return <AboutAdmin />;
}
