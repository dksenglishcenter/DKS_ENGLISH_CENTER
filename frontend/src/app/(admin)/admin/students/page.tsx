import { StudentsAdmin } from "@/components/admin/students-admin";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata = createPageMetadata({
  title: "Admin · Học viên",
  description: "Quản lý học viên.",
  path: "/admin/students",
  noIndex: true,
});

export default function Page() {
  return <StudentsAdmin />;
}
