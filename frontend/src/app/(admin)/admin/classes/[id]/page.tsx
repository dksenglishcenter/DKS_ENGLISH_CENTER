import { ClassDetailAdmin } from "@/components/admin/class-detail-admin";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata = createPageMetadata({
  title: "Admin · Chi tiết lớp",
  description: "Danh sách học viên trong lớp.",
  path: "/admin/classes",
  noIndex: true,
});

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ClassDetailAdmin classId={id} />;
}
