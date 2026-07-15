import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata = createPageMetadata({
  title: "Blog",
  description: "Mẹo học tiếng Anh, luyện thi IELTS và kinh nghiệm từ DKS English Center.",
  path: "/blog",
});

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children;
}
