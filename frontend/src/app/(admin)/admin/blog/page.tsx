import { BlogAdmin } from "@/components/admin/blog-admin";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata = createPageMetadata({
  title: "Admin · Blog",
  description: "Quản lý bài viết blog.",
  path: "/admin/blog",
  noIndex: true,
});

export default function Page() {
  return <BlogAdmin />;
}
