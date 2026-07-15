import { cache } from "react";

import {
  BLOG_POSTS,
  type BlogPost,
  type BlogPostSummary,
} from "@/data/blog-posts";

export const BLOG_REVALIDATE_SECONDS = 3600 as const;

/**
 * Adapter dữ liệu Blog. UI chỉ gọi các hàm trong file này để có thể đổi sang API/CMS
 * mà không thay đổi component. Với fetch, dùng `next: { revalidate: 3600, tags: ["blog"] }`.
 */
export const getBlogPosts = cache(async (): Promise<BlogPost[]> => BLOG_POSTS);

export const getBlogPostSummaries = cache(
  async (): Promise<BlogPostSummary[]> => {
    const posts = await getBlogPosts();
    return posts.map(
      ({
        slug,
        title,
        excerpt,
        category,
        publishedAt,
        readTimeMinutes,
        coverImageId,
        featured,
      }) => ({
        slug,
        title,
        excerpt,
        category,
        publishedAt,
        readTimeMinutes,
        coverImageId,
        featured,
      }),
    );
  },
);

export const getBlogPostBySlug = cache(
  async (slug: string): Promise<BlogPost | undefined> => {
    const posts = await getBlogPosts();
    return posts.find((post) => post.slug === slug);
  },
);

export async function getRelatedBlogPosts(
  post: BlogPost,
  limit = 2,
): Promise<BlogPost[]> {
  const posts = await getBlogPosts();
  const sameCategory = posts.filter(
    (candidate) =>
      candidate.slug !== post.slug && candidate.category === post.category,
  );
  const fallback = posts.filter(
    (candidate) =>
      candidate.slug !== post.slug && candidate.category !== post.category,
  );

  return [...sameCategory, ...fallback].slice(0, limit);
}
