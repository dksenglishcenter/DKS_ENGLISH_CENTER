import AdminPlaceholderPage from "@/components/admin/admin-placeholder";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata = createPageMetadata({
  title: "Admin · Liên hệ",
  description: "Quản lý đơn liên hệ.",
  path: "/admin/contacts",
  noIndex: true,
});

export default function Page() {
  return (
    <AdminPlaceholderPage
      title="Liên hệ"
      description="Module quản lý contact_submissions sẽ được nối API ở bước sau."
    />
  );
}
