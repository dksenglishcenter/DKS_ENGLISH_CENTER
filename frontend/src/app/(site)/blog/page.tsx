import { BlogPage } from "@/components/pages/blog-page";
import { getBlogPostSummaries } from "@/lib/blog/api";
import { normalizeBlogTag } from "@/lib/blog/types";

/** HTML/RSC được dựng tĩnh và làm mới nền tối đa mỗi giờ khi có request. */
export const revalidate = 3600;

type BlogRouteProps = {
  searchParams: Promise<{ tag?: string | string[] }>;
};

export default async function Page({ searchParams }: BlogRouteProps) {
  const posts = await getBlogPostSummaries();
  const params = await searchParams;
  const rawTag = Array.isArray(params.tag) ? params.tag[0] : params.tag;
  const initialTag = normalizeBlogTag(rawTag ?? "") || null;

  return <BlogPage posts={posts} initialTag={initialTag} />;
}
