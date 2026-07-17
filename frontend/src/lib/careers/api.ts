import { apiFetch } from "@/lib/api/client";
import type {
  CareerApplicationPayload,
  CareerApplicationResponse,
  CareerApplicationsResponse,
} from "./types";

type ListCareerApplicationsOptions = {
  page: number;
  pageSize: number;
  search?: string;
  jobId?: string;
  signal?: AbortSignal;
};

export async function submitCareerApplication(
  payload: CareerApplicationPayload,
) {
  return apiFetch<CareerApplicationResponse>("/careers", {
    method: "POST",
    json: payload,
  });
}

export function listCareerApplications({
  page,
  pageSize,
  search,
  jobId,
  signal,
}: ListCareerApplicationsOptions) {
  const query = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });
  if (search) query.set("search", search);
  if (jobId) query.set("jobId", jobId);

  return apiFetch<CareerApplicationsResponse>(
    `/careers/applications?${query.toString()}`,
    {
      method: "GET",
      cache: "no-store",
      signal,
    },
  );
}

export function deleteCareerApplication(id: string) {
  return apiFetch<{ success: true; message: string }>(
    `/careers/applications/${id}`,
    { method: "DELETE" },
  );
}
