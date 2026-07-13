import { ContactPage } from "@/components/pages/contact-page";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata = createPageMetadata({
  title: "Liên hệ và đăng ký tư vấn",
  description:
    "Liên hệ DKS English Center để được giải đáp câu hỏi và đăng ký tư vấn khóa học tiếng Anh phù hợp.",
  path: "/contact",
});

export default function Page() {
  return <ContactPage />;
}
