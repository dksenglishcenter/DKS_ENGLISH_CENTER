import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata = createPageMetadata({
  title: "Tuyển Dụng",
  description:
    "Tuyển dụng giáo viên IELTS, tư vấn tuyển sinh và gia sư tiếng Anh tại DKS English Center. Môi trường năng động, lương cạnh tranh, cơ hội thăng tiến.",
  path: "/careers",
  keywords: [
    "tuyển dụng giáo viên tiếng Anh",
    "việc làm IELTS teacher",
    "tuyển dụng trung tâm Anh ngữ",
    "DKS careers",
    "giáo viên IELTS HCM",
  ],
});

export default function CareersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
