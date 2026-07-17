import { JobsAdmin } from "@/components/admin/jobs/jobs-admin";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata = createPageMetadata({
  title: "Admin · Tuyển dụng",
  description: "Quản lý các vị trí tuyển dụng của DKS English Center.",
  path: "/admin/careers",
  noIndex: true,
});

export default function Page() {
  return <JobsAdmin />;
}
