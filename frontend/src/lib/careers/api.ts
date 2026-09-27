import { apiFetchResponse } from "@/lib/api/client";
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
  return apiFetchResponse<CareerApplicationResponse["data"], never, true>(
    "/careers",
    {
      method: "POST",
      json: payload,
    },
  );
}

export async function uploadCareerCv(file: File) {
  const { getApiUrl } = await import("@/lib/api/config");
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${getApiUrl()}/careers/upload-cv`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const { parseApiErrorBody } = await import("@/lib/errors/format-error");
    const raw = await response.text().catch(() => response.statusText);
    throw parseApiErrorBody(raw, response.status);
  }

  const json = (await response.json()) as {
    data?: { url?: string; fileName?: string };
    message?: string;
  };
  const url = json.data?.url?.trim();
  if (!url) {
    throw new Error(json.message || "Upload CV thất bại");
  }
  const fileName =
    json.data?.fileName?.trim() || file.name.trim() || "CV.pdf";
  return { url, fileName, message: json.message ?? "Upload CV thành công" };
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

  return apiFetchResponse<
    CareerApplicationsResponse["data"],
    CareerApplicationsResponse["meta"]
  >(`/careers/applications?${query.toString()}`, {
    method: "GET",
    cache: "no-store",
    signal,
  });
}

export function deleteCareerApplication(id: string) {
  return apiFetchResponse<null, never, true>(`/careers/applications/${id}`, {
    method: "DELETE",
  });
}
