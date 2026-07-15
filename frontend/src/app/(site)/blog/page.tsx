import { BlogPage } from "@/components/pages/blog-page";
import { getBlogPostSummaries } from "@/lib/blog/api";

/** HTML/RSC được dựng tĩnh và làm mới nền tối đa mỗi giờ khi có request. */
export const revalidate = 3600;

export default async function Page() {
  const posts = await getBlogPostSummaries();

  return <BlogPage posts={posts} />;
}
