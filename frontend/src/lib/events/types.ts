export type EventItem = {
  id: string;
  title: string;
  summary: string;
  body: string | null;
  eventDate: string | null;
  coverImageUrl: string | null;
  sortOrder: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
};

export type EventPayload = {
  title: string;
  summary: string;
  body?: string;
  eventDate?: string | null;
  coverImageUrl?: string | null;
  sortOrder?: number;
  isPublished?: boolean;
};

export type ListEventsParams = {
  publishedOnly?: boolean;
};
