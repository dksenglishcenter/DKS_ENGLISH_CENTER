import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata = createPageMetadata({
  title: "Admin",
  description: "Bảng quản trị DKS English Center.",
  path: "/admin",
  noIndex: true,
});

export default function AdminDashboardPage() {
  return <AdminDashboard />;
}
