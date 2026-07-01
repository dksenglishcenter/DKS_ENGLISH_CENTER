import { JsonLd } from "@/components/seo/json-ld";
import { createPageMetadata } from "@/lib/seo/metadata";
import { coursesPageSchema } from "@/lib/seo/schemas";

export const metadata = createPageMetadata({
  title: "Khóa Học Tiếng Anh",
  description:
    "Khóa học IELTS, luyện thi THPT, giao tiếp và gia sư 1-1 tại DKS English Center. Lộ trình rõ ràng, giáo viên chuẩn quốc tế, học phí minh bạch.",
  path: "/courses",
  keywords: [
    "khóa học tiếng Anh",
    "luyện thi IELTS",
    "IELTS TP HCM",
    "tiếng Anh giao tiếp",
    "gia sư tiếng Anh 1-1",
    "DKS English Center",
    "học phí IELTS",
  ],
});

export default function CoursesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <JsonLd data={coursesPageSchema()} />
      {children}
    </>
  );
}
