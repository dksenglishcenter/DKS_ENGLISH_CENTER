export type CountPublished = {
  total: number;
  published: number;
};

export type CountCap = CountPublished & {
  max: number;
};

export type AdminDashboardStats = {
  courses: CountPublished & {
    featured: number;
    draft: number;
  };
  successStories: CountPublished;
  gallery: CountCap;
  facilities: CountCap;
  about: {
    hasVisionImage: boolean;
  };
  teachers: CountPublished;
  blog: CountPublished & {
    featured: number;
    draft: number;
  };
  contacts: {
    total: number;
    last7Days: number;
  };
  careers: {
    total: number;
    last7Days: number;
  };
  users: {
    total: number;
    admins: number;
    members: number;
  };
};
