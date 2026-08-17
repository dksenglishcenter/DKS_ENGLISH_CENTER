import { AttendanceAdmin } from "@/components/admin/attendance-admin";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata = createPageMetadata({
  title: "Admin · Điểm danh",
  description: "Điểm danh theo lớp và ngày.",
  path: "/admin/attendance",
  noIndex: true,
});

export default function Page() {
  return <AttendanceAdmin />;
}
