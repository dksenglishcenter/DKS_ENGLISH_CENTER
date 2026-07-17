import type { ApiResponse } from "@/lib/api/client";

export type CareerApplicationPayload = {
  jobId: string;
  fullName: string;
  email: string;
  phone: string;
  introduction?: string;
};

export type CareerApplicationReceipt = {
  id: string;
  createdAt: string;
};

export type CareerApplicationResponse = ApiResponse<
  CareerApplicationReceipt,
  never,
  true
>;

export type CareerApplication = {
  id: string;
  jobId: string | null;
  fullName: string;
  email: string;
  phone: string;
  position: string;
  introduction: string | null;
  createdAt: string;
  job: {
    id: string;
    title: string;
    isPublished: boolean;
  } | null;
};

export type CareerApplicationsMeta = {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
};

export type CareerApplicationsResponse = ApiResponse<
  CareerApplication[],
  CareerApplicationsMeta
>;
