import { TuitionAdmin } from "@/components/admin/tuition-admin";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata = createPageMetadata({
  title: "Admin · Học phí",
  description: "Quản lý học phí.",
  path: "/admin/tuition",
  noIndex: true,
});

export default function Page() {
  return <TuitionAdmin />;
}
