import AdminPlaceholderPage from "@/components/admin/admin-placeholder";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata = createPageMetadata({
  title: "Admin · Người dùng",
  description: "Quản lý tài khoản người dùng.",
  path: "/admin/users",
  noIndex: true,
});

export default function Page() {
  return (
    <AdminPlaceholderPage
      title="Người dùng"
      description="Module danh sách USER/ADMIN sẽ được nối API ở bước sau."
    />
  );
}
