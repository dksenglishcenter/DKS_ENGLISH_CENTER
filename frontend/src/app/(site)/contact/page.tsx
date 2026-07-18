import { ContactPage } from "@/components/pages/contact-page";
import { getPublicContactInformation } from "@/lib/contact/server";
import { listCourses } from "@/lib/courses/api";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata = createPageMetadata({
  title: "Liên hệ và đăng ký tư vấn",
  description:
    "Liên hệ DKS English Center để được giải đáp câu hỏi và đăng ký tư vấn khóa học tiếng Anh phù hợp.",
  path: "/contact",
});

export default async function Page() {
  const [contactInfo, coursesResponse] = await Promise.all([
    getPublicContactInformation(),
    listCourses({ publishedOnly: true }).catch(() => ({ courses: [] })),
  ]);
  const courseOptions = Array.from(
    new Set(coursesResponse.courses.map((course) => course.title)),
  );

  return (
    <ContactPage
      contactInfo={contactInfo}
      courseOptions={courseOptions}
    />
  );
}
