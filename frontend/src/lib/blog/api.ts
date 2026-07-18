import { cache } from "react";

import { apiFetch } from "@/lib/api/client";
import { toSearchParams } from "@/lib/api/query";
import type {
  BlogPost,
  BlogPostPayload,
  BlogPostSummary,
  BlogSection,
  ListBlogPostsParams,
} from "./types";

export const BLOG_REVALIDATE_SECONDS = 3600 as const;

function toDateOnly(value: string) {
  return value.slice(0, 10);
}

function normalizeSections(value: unknown): BlogSection[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter(
      (item): item is Record<string, unknown> =>
        Boolean(item) && typeof item === "object",
    )
    .filter(
      (item) =>
        typeof item.heading === "string" && typeof item.body === "string",
    )
    .map((item) => {
      const section: BlogSection = {
        heading: item.heading as string,
        body: item.body as string,
      };
      if (typeof item.imageUrl === "string" && item.imageUrl.trim()) {
        section.imageUrl = item.imageUrl.trim();
      }
      if (typeof item.imageAlt === "string" && item.imageAlt.trim()) {
        section.imageAlt = item.imageAlt.trim();
      }
      if (typeof item.linkHref === "string" && item.linkHref.trim()) {
        section.linkHref = item.linkHref.trim();
      }
      if (typeof item.linkLabel === "string" && item.linkLabel.trim()) {
        section.linkLabel = item.linkLabel.trim();
      }
      return section;
    });
}

function normalizeBlogPost(post: BlogPost): BlogPost {
  return {
    ...post,
    publishedAt: toDateOnly(post.publishedAt),
    sections: normalizeSections(post.sections),
  };
}

async function fetchBlogPosts(params: ListBlogPostsParams = {}) {
  try {
    const response = await apiFetch<{ blogPosts: BlogPost[] }>(
      `/blog-posts${toSearchParams({
        featured: params.featured,
        category: params.category,
        publishedOnly: params.publishedOnly,
      })}`,
      {
        method: "GET",
        next: {
          revalidate: BLOG_REVALIDATE_SECONDS,
          tags: ["blog"],
        },
      },
    );

    return response.blogPosts.map(normalizeBlogPost);
  } catch {
    // Build/ISR khi API tạm offline — trang vẫn dựng được, ISR sẽ thử lại.
    return [];
  }
}

/**
 * Adapter dữ liệu Blog. UI chỉ gọi các hàm trong file này.
 * Public dùng ISR/revalidate; admin dùng cache: "no-store".
 */
export const getBlogPosts = cache(async (): Promise<BlogPost[]> => {
  return fetchBlogPosts({ publishedOnly: true });
});

export const getBlogPostSummaries = cache(
  async (): Promise<BlogPostSummary[]> => {
    const posts = await getBlogPosts();
    return posts.map(
      ({
        id,
        slug,
        title,
        excerpt,
        category,
        publishedAt,
        readTimeMinutes,
        coverImageUrl,
        featured,
      }) => ({
        id,
        slug,
        title,
        excerpt,
        category,
        publishedAt,
        readTimeMinutes,
        coverImageUrl,
        featured,
      }),
    );
  },
);

export const getBlogPostBySlug = cache(
  async (slug: string): Promise<BlogPost | undefined> => {
    try {
      const response = await apiFetch<{ blogPost: BlogPost }>(
        `/blog-posts/${encodeURIComponent(slug)}`,
        {
          method: "GET",
          next: {
            revalidate: BLOG_REVALIDATE_SECONDS,
            tags: ["blog"],
          },
        },
      );
      return normalizeBlogPost(response.blogPost);
    } catch {
      return undefined;
    }
  },
);

export async function getRelatedBlogPosts(
  post: BlogPost,
  limit = 2,
): Promise<BlogPostSummary[]> {
  const posts = await getBlogPostSummaries();
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

export async function listBlogPosts(params: ListBlogPostsParams = {}) {
  return apiFetch<{ blogPosts: BlogPost[] }>(
    `/blog-posts${toSearchParams({
      featured: params.featured,
      category: params.category,
      publishedOnly: params.publishedOnly,
    })}`,
    { method: "GET", cache: "no-store" },
  ).then((response) => ({
    blogPosts: response.blogPosts.map(normalizeBlogPost),
  }));
}

/** Xóa cache ISR tag "blog" trên Next server để public thấy thay đổi ngay. */
async function revalidateBlogCache() {
  try {
    await fetch("/api/revalidate?tag=blog", { method: "POST" });
  } catch {
    // best-effort — cache tự hết hạn sau revalidate 3600s
  }
}

export async function createBlogPost(payload: BlogPostPayload) {
  const response = await apiFetch<{ message: string; blogPost: BlogPost }>(
    "/blog-posts",
    {
      method: "POST",
      json: payload,
    },
  );
  await revalidateBlogCache();
  return { ...response, blogPost: normalizeBlogPost(response.blogPost) };
}

export async function updateBlogPost(
  id: string,
  payload: Partial<BlogPostPayload>,
) {
  const response = await apiFetch<{ message: string; blogPost: BlogPost }>(
    `/blog-posts/${id}`,
    {
      method: "PATCH",
      json: payload,
    },
  );
  await revalidateBlogCache();
  return { ...response, blogPost: normalizeBlogPost(response.blogPost) };
}

export async function deleteBlogPost(id: string) {
  const response = await apiFetch<{ message: string }>(`/blog-posts/${id}`, {
    method: "DELETE",
  });
  await revalidateBlogCache();
  return response;
}
