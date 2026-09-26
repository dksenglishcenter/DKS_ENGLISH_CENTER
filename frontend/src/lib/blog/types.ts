export type BlogSection = {
  heading: string;
  body: string;
  imageUrl?: string | null;
  imageAlt?: string;
  linkLabel?: string;
  linkHref?: string;
};

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  tags: string[];
  publishedAt: string;
  readTimeMinutes: number;
  coverImageUrl: string;
  featured: boolean;
  intro: string;
  sections: BlogSection[];
  takeaway: string;
  isPublished: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type BlogPostSummary = Pick<
  BlogPost,
  | "id"
  | "slug"
  | "title"
  | "excerpt"
  | "category"
  | "tags"
  | "publishedAt"
  | "readTimeMinutes"
  | "coverImageUrl"
  | "featured"
>;

export type BlogPostPayload = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  tags?: string[];
  publishedAt: string;
  readTimeMinutes: number;
  coverImageUrl: string;
  featured?: boolean;
  intro: string;
  sections: BlogSection[];
  takeaway: string;
  sortOrder?: number;
  isPublished?: boolean;
};

export type ListBlogPostsParams = {
  featured?: boolean;
  category?: string;
  tag?: string;
  publishedOnly?: boolean;
};

/** Gợi ý chuyên mục — admin vẫn nhập tùy ý ngoài list này. */
export const BLOG_CATEGORY_SUGGESTIONS = [
  "Reading",
  "Listening",
  "Writing",
  "Speaking",
  "IELTS",
  "TOEIC",
  "THPT",
  "Tips",
  "Chia sẻ kinh nghiệm",
  "Phương pháp học",
  "Phụ huynh",
] as const;

/** Internal path (/courses) or absolute http(s) URL. */
export function isValidBlogLinkHref(href: string): boolean {
  const value = href.trim();
  if (!value) return false;
  if (value.startsWith("/") && !value.startsWith("//")) return true;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function normalizeBlogTag(raw: string): string {
  return raw.trim().replace(/^#+/, "").replace(/\s+/g, "-");
}

export function parseBlogTagsInput(value: string): string[] {
  const seen = new Set<string>();
  const tags: string[] = [];
  for (const part of value.split(/[,;]+/)) {
    const tag = normalizeBlogTag(part);
    if (!tag || seen.has(tag.toLowerCase())) continue;
    seen.add(tag.toLowerCase());
    tags.push(tag);
  }
  return tags;
}

export function formatBlogTag(tag: string): string {
  const clean = normalizeBlogTag(tag);
  return clean ? `#${clean}` : "";
}
