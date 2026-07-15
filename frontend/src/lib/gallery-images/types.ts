export type GalleryImage = {
  id: string;
  imageUrl: string;
  alt: string;
  objectPosition: string;
  sortOrder: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
};

export type GalleryImagePayload = {
  imageUrl: string;
  alt: string;
  objectPosition: string;
  sortOrder: number;
  isPublished: boolean;
};

export type ListGalleryImagesParams = {
  publishedOnly?: boolean;
};

export const MAX_GALLERY_IMAGES = 6;
