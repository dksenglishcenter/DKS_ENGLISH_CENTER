import { EventsAdmin } from "@/components/admin/events-admin";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata = createPageMetadata({
  title: "Admin · Sự kiện",
  description: "Quản lý thông báo sự kiện DKS.",
  path: "/admin/events",
});

export default function AdminEventsPage() {
  return <EventsAdmin />;
}
