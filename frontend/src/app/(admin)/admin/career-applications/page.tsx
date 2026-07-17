import { CareerApplicationsAdmin } from "@/components/admin/career-applications-admin";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata = createPageMetadata({
  title: "Admin · Đơn ứng tuyển",
  description: "Quản lý các đơn ứng tuyển gửi tới DKS English Center.",
  path: "/admin/career-applications",
  noIndex: true,
});

export default function Page() {
  return <CareerApplicationsAdmin />;
}
