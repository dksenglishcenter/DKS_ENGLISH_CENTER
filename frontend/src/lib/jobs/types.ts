export type Job = {
  id: string;
  title: string;
  type: string;
  location: string;
  salary: string;
  duties: string[];
  benefits: string[];
  req: string;
  sortOrder: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PublicJob = Pick<
  Job,
  | "id"
  | "title"
  | "type"
  | "location"
  | "salary"
  | "duties"
  | "benefits"
  | "req"
>;

export type JobPayload = Pick<
  Job,
  | "title"
  | "type"
  | "location"
  | "salary"
  | "duties"
  | "benefits"
  | "req"
  | "sortOrder"
  | "isPublished"
>;

export type JobFormValues = Omit<JobPayload, "sortOrder"> & {
  sortOrder: string;
};

export type JobStatusFilter = "all" | "published" | "draft";

export type JobsPagination = {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  nextSortOrder: number;
};

export type AdminJobsResponse = {
  jobs: Job[];
  pagination: JobsPagination;
};

export type ListAdminJobsOptions = {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: JobStatusFilter;
  signal?: AbortSignal;
};
