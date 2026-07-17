import { apiFetch } from "@/lib/api/client";
import type {
  AdminJobsResponse,
  Job,
  JobPayload,
  ListAdminJobsOptions,
} from "./types";

export function listPublishedJobs() {
  return apiFetch<{ jobs: Job[] }>("/jobs", {
    method: "GET",
    cache: "no-store",
  });
}

export function listAdminJobs({
  page = 1,
  pageSize = 20,
  search,
  status = "all",
  signal,
}: ListAdminJobsOptions = {}) {
  const query = new URLSearchParams();
  query.set("page", String(page));
  query.set("pageSize", String(pageSize));
  if (search) query.set("search", search);
  if (status !== "all") {
    query.set("isPublished", status === "published" ? "true" : "false");
  }
  const suffix = query.size > 0 ? `?${query.toString()}` : "";

  return apiFetch<AdminJobsResponse>(`/jobs/admin${suffix}`, {
    method: "GET",
    cache: "no-store",
    signal,
  });
}

export function createJob(payload: JobPayload) {
  return apiFetch<{ message: string; job: Job }>("/jobs", {
    method: "POST",
    json: payload,
  });
}

export function updateJob(id: string, payload: Partial<JobPayload>) {
  return apiFetch<{ message: string; job: Job }>(`/jobs/${id}`, {
    method: "PATCH",
    json: payload,
  });
}

export function deleteJob(id: string) {
  return apiFetch<{ message: string }>(`/jobs/${id}`, {
    method: "DELETE",
  });
}
