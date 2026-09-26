export type EventPhoto = {
  id: string;
  imageUrl: string;
  alt: string;
  objectPosition: string;
  sortOrder: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
};

export type EventPhotoPayload = {
  imageUrl: string;
  alt: string;
  objectPosition: string;
  sortOrder: number;
  isPublished: boolean;
};

export type ListEventPhotosParams = {
  publishedOnly?: boolean;
};

export const MAX_EVENT_PHOTOS = 24;
