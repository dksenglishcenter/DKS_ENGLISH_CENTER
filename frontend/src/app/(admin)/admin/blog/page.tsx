import AdminPlaceholderPage from "@/components/admin/admin-placeholder";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata = createPageMetadata({
  title: "Admin · Blog",
  description: "Quản lý bài viết blog.",
  path: "/admin/blog",
  noIndex: true,
});

export default function Page() {
  return (
    <AdminPlaceholderPage
      title="Blog"
      description="Module quản lý bài viết blog để trống — sẽ được nối API và CRUD ở bước sau."
    />
  );
}
