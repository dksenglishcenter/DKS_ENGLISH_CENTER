import { ParentPortal } from "@/components/parent/parent-portal";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata = createPageMetadata({
  title: "Cổng phụ huynh",
  description: "Xem điểm danh và học phí của con.",
  path: "/parent",
  noIndex: true,
});

export default function Page() {
  return <ParentPortal />;
}
