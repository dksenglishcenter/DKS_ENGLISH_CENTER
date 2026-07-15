import AdminPlaceholderPage from "@/components/admin/admin-placeholder";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata = createPageMetadata({
  title: "Admin · Tuyển dụng",
  description: "Quản lý đơn ứng tuyển.",
  path: "/admin/careers",
  noIndex: true,
});

export default function Page() {
  return (
    <AdminPlaceholderPage
      title="Tuyển dụng"
      description="Module quản lý career_applications sẽ được nối API ở bước sau."
    />
  );
}
