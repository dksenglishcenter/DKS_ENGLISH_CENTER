import AdminPlaceholderPage from "@/components/admin/admin-placeholder";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata = createPageMetadata({
  title: "Admin · Media",
  description: "Quản lý media Cloudinary.",
  path: "/admin/media",
  noIndex: true,
});

export default function Page() {
  return (
    <AdminPlaceholderPage
      title="Media"
      description="Module upload/list ảnh Cloudinary sẽ được nối API ở bước sau."
    />
  );
}
