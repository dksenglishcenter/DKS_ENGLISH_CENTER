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
  publishedOnly?: boolean;
};

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
