export type Course = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  level: string;
  target: string;
  tuition: string;
  duration: string;
  perks: string[];
  category: string;
  coverImageUrl: string;
  accent: string;
  bg: string;
  icon: string;
  featured: boolean;
  sortOrder: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CoursePayload = {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  level: string;
  target: string;
  tuition: string;
  duration: string;
  perks: string[];
  category: string;
  coverImageUrl: string;
  accent?: string;
  bg?: string;
  icon?: string;
  featured?: boolean;
  sortOrder?: number;
  isPublished?: boolean;
};

export type ListCoursesParams = {
  featured?: boolean;
  category?: string;
  publishedOnly?: boolean;
};
