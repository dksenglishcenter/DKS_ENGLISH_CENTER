import { JsonLd } from "@/components/seo/json-ld";
import { createPageMetadata } from "@/lib/seo/metadata";
import { aboutPageSchema } from "@/lib/seo/schemas";

export const metadata = createPageMetadata({
  title: "Về Chúng Tôi",
  description:
    "DKS English Center — hơn 8 năm đồng hành cùng học viên Việt Nam. Đội ngũ giáo viên tận tâm, phương pháp sáng tạo, cơ sở vật chất hiện đại tại TP. Hồ Chí Minh.",
  path: "/about",
  keywords: [
    "về DKS English Center",
    "trung tâm tiếng Anh TP HCM",
    "giáo viên tiếng Anh",
    "sứ mệnh DKS",
    "học tiếng Anh uy tín",
  ],
});

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <JsonLd data={aboutPageSchema()} />
      {children}
    </>
  );
}
