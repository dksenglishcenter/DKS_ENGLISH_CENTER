import { ExamGradingAdmin } from "@/components/admin/exams/exam-grading-admin";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata = createPageMetadata({
  title: "Admin · Chấm bài",
  description: "Chấm bài Viết/Nói của học viên DKS English Center.",
  path: "/admin/exam-grading",
  noIndex: true,
});

export default function Page() {
  return <ExamGradingAdmin />;
}
