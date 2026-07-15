export type SuccessStory = {
  id: string;
  name: string;
  course: string;
  badge: string;
  text: string;
  stars: number;
  avatar: string;
  sortOrder: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
};

export type SuccessStoryPayload = {
  name: string;
  course: string;
  badge: string;
  text: string;
  stars: number;
  avatar: string;
  sortOrder: number;
  isPublished: boolean;
};

export type ListSuccessStoriesParams = {
  publishedOnly?: boolean;
};
