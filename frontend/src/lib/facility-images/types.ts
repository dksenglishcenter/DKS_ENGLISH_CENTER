export type FacilityImage = {
  id: string;
  imageUrl: string;
  title: string;
  sortOrder: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
};

export type FacilityImagePayload = {
  imageUrl: string;
  title: string;
  sortOrder: number;
  isPublished: boolean;
};

export type ListFacilityImagesParams = {
  publishedOnly?: boolean;
};

export const MAX_FACILITY_IMAGES = 6;
