import { notFound } from "next/navigation";

import { BlogPostPage } from "@/components/pages/blog-post-page";
import {
  getBlogPostBySlug,
  getBlogPosts,
  getRelatedBlogPosts,
} from "@/lib/blog/api";
import { createPageMetadata } from "@/lib/seo/metadata";

type BlogPostRouteProps = {
  params: Promise<{ slug: string }>;
};

/** SSG cho slug hiện có, sau đó ISR làm mới nội dung tối đa mỗi giờ. */
export const revalidate = 3600;

export async function generateStaticParams() {
  try {
    const posts = await getBlogPosts();
    return posts.map((post) => ({ slug: post.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: BlogPostRouteProps) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) return {};

  return createPageMetadata({
    title: post.title,
    description: post.excerpt,
    path: `/blog/${post.slug}`,
  });
}

export default async function Page({ params }: BlogPostRouteProps) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) notFound();

  const [relatedPosts, allPosts] = await Promise.all([
    getRelatedBlogPosts(post),
    getBlogPosts(),
  ]);
  const tagCounts = new Map<string, number>();
  for (const item of allPosts) {
    for (const tag of item.tags ?? []) {
      tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
    }
  }
  const popularTags = [...tagCounts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([tag]) => tag)
    .slice(0, 20);

  return (
    <BlogPostPage
      post={post}
      relatedPosts={relatedPosts}
      popularTags={popularTags}
    />
  );
}
