import { cache } from "react";

import { BLOG_POSTS, type BlogPost } from "@/data/blog-posts";

/** ISR: HTML tĩnh, tự build lại sau N giây khi có request mới. */
export const BLOG_REVALIDATE_SECONDS = 3600 as const;

/**
 * Lấy danh sách bài viết.
 * TODO: thay bằng fetch backend khi API sẵn sàng:
 *
 * const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/blog`, {
 *   next: { revalidate: BLOG_REVALIDATE_SECONDS },
 * });
 * return res.json();
 */
export const getBlogPosts = cache(async (): Promise<BlogPost[]> => {
  return BLOG_POSTS;
});

export const getBlogPostBySlug = cache(
  async (slug: string): Promise<BlogPost | undefined> => {
    const posts = await getBlogPosts();
    return posts.find((post) => post.slug === slug);
  },
);
