import { TeachersAdmin } from "@/components/admin/teachers-admin";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata = createPageMetadata({
  title: "Admin · Giáo viên",
  description: "Quản lý đội ngũ giáo viên DKS.",
  path: "/admin/teachers",
  noIndex: true,
});

export default function AdminTeachersPage() {
  return <TeachersAdmin />;
}
