import { ContactInformationAdmin } from "@/components/admin/contact-information-admin";
import { ContactSubmissionsAdmin } from "@/components/admin/contact-submissions-admin";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata = createPageMetadata({
  title: "Admin · Liên hệ",
  description: "Quản lý thông tin liên hệ hiển thị trên website.",
  path: "/admin/contacts",
  noIndex: true,
});

export default function Page() {
  return (
    <div className="flex flex-col gap-10">
      <ContactInformationAdmin />
      <ContactSubmissionsAdmin />
    </div>
  );
}
