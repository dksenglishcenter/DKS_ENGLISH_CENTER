import { CoursesAdmin } from "@/components/admin/courses-admin";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata = createPageMetadata({
  title: "Admin · Khóa học",
  description: "Quản lý khóa học DKS English Center.",
  path: "/admin/courses",
  noIndex: true,
});

export default function AdminCoursesPage() {
  return <CoursesAdmin />;
}
