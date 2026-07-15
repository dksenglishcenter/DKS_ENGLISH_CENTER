export type Teacher = {
  id: string;
  name: string;
  title: string;
  cred: string;
  exp: string;
  imageUrl: string;
  bio: string;
  sortOrder: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
};

export type TeacherPayload = {
  name: string;
  title: string;
  cred: string;
  exp: string;
  imageUrl: string;
  bio: string;
  sortOrder: number;
  isPublished: boolean;
};

export type ListTeachersParams = {
  publishedOnly?: boolean;
};
