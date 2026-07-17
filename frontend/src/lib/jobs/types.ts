import type { ApiResponse } from "@/lib/api/client";

export type SalaryType = "RANGE" | "FIXED" | "NEGOTIABLE";
export type SalaryCurrency = "VND";

export type Job = {
  id: string;
  title: string;
  type: string;
  location: string;
  salaryType: SalaryType;
  salaryMin: number | null;
  salaryMax: number | null;
  currency: SalaryCurrency;
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
  | "salaryType"
  | "salaryMin"
  | "salaryMax"
  | "currency"
  | "duties"
  | "benefits"
  | "req"
>;

export type JobPayload = Pick<
  Job,
  | "title"
  | "type"
  | "location"
  | "salaryType"
  | "salaryMin"
  | "salaryMax"
  | "currency"
  | "duties"
  | "benefits"
  | "req"
  | "sortOrder"
  | "isPublished"
>;

export type JobFormValues = Omit<
  JobPayload,
  "sortOrder" | "salaryType" | "salaryMin" | "salaryMax"
> & {
  sortOrder: string;
  salaryType: SalaryType | "";
  salaryMin: string;
  salaryMax: string;
};

export type JobStatusFilter = "all" | "published" | "draft";

export type JobsPagination = {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  nextSortOrder: number;
};

export type AdminJobsResponse = ApiResponse<Job[], JobsPagination>;

export type ListAdminJobsOptions = {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: JobStatusFilter;
  signal?: AbortSignal;
};
