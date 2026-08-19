import { ExamsAdmin } from "@/components/admin/exams/exams-admin";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata = createPageMetadata({
  title: "Admin · Đề thi thử",
  description: "Quản lý đề thi thử IELTS của DKS English Center.",
  path: "/admin/exams",
  noIndex: true,
});

export default function Page() {
  return <ExamsAdmin />;
}
