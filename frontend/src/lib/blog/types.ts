export type BlogSection = {
  heading: string;
  body: string;
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
