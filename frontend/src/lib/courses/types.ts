export type CourseRoadmapStage = {
  name: string;
  band?: string;
  modules: string[];
};

export type CourseRoadmap = {
  stages: CourseRoadmapStage[];
};

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
  startDate: string | null;
  endDate: string | null;
  perks: string[];
  curriculum: string[];
  roadmap: CourseRoadmap | null;
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
  startDate?: string | null;
  endDate?: string | null;
  perks: string[];
  curriculum?: string[];
  roadmap?: CourseRoadmap | null;
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
