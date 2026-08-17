import { ClassesAdmin } from "@/components/admin/classes-admin";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata = createPageMetadata({
  title: "Admin · Lớp học",
  description: "Quản lý lớp học.",
  path: "/admin/classes",
  noIndex: true,
});

export default function Page() {
  return <ClassesAdmin />;
}
