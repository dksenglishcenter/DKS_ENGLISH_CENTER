import { JsonLd } from "@/components/seo/json-ld";
import { createPageMetadata } from "@/lib/seo/metadata";
import { coursesPageSchema } from "@/lib/seo/schemas";

export const metadata = createPageMetadata({
  title: "Khóa Học Tiếng Anh",
  description:
    "Khóa luyện thi vào lớp 10, THPT và Đại học, IELTS 1:1 và tiếng Anh Global Success lớp 1–9 tại DKS English Center.",
  path: "/courses",
  keywords: [
    "khóa học tiếng Anh",
    "luyện thi vào lớp 10",
    "luyện thi THPT",
    "luyện thi Đại học",
    "luyện thi IELTS",
    "IELTS 1 kèm 1",
    "tiếng Anh Global Success",
    "tiếng Anh lớp 1 đến lớp 9",
    "DKS English Center",
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
