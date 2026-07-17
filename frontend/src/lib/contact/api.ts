import { apiFetchResponse } from "@/lib/api/client";
import { CONTACT_INFORMATION_CACHE_TAG } from "./constants";
import { parseContactInformationResponse } from "./validation";
import type {
  ContactFormPayload,
  ContactFormResponse,
  ContactInformationPayload,
  ContactInformationResponse,
  ContactSubmissionsResponse,
} from "./types";

const CONTACT_REQUEST_TIMEOUT_MS = 5_000;

type GetContactInformationOptions = {
  revalidate?: number;
};

type ListContactSubmissionsOptions = {
  page: number;
  pageSize: number;
  search?: string;
  signal?: AbortSignal;
};

export async function submitContactForm(payload: ContactFormPayload) {
  return apiFetchResponse<ContactFormResponse["data"], never, true>(
    "/contact",
    {
      method: "POST",
      json: payload,
    },
  );
}

export function listContactSubmissions({
  page,
  pageSize,
  search,
  signal,
}: ListContactSubmissionsOptions) {
  const query = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });
  if (search) query.set("search", search);

  return apiFetchResponse<
    ContactSubmissionsResponse["data"],
    ContactSubmissionsResponse["meta"]
  >(`/contact/submissions?${query.toString()}`, {
    method: "GET",
    cache: "no-store",
    signal,
  });
}

export function deleteContactSubmission(id: string) {
  return apiFetchResponse<null, never, true>(`/contact/submissions/${id}`, {
    method: "DELETE",
  });
}

export async function getContactInformation(
  options: GetContactInformationOptions = {},
) {
  const response = await apiFetchResponse<unknown>("/contact/info", {
    method: "GET",
    ...(options.revalidate === undefined
      ? { cache: "no-store" as const }
      : {
          next: {
            revalidate: options.revalidate,
            tags: [CONTACT_INFORMATION_CACHE_TAG],
          },
        }),
    signal: AbortSignal.timeout(CONTACT_REQUEST_TIMEOUT_MS),
  });

  return {
    ...response,
    data: parseContactInformationResponse(response.data),
  };
}

export async function replaceContactInformation(
  payload: ContactInformationPayload,
) {
  return apiFetchResponse<ContactInformationResponse["data"], never, true>(
    "/contact/info",
    {
      method: "PUT",
      json: payload,
    },
  );
}

export async function updateContactInformation(
  payload: Partial<ContactInformationPayload>,
) {
  return apiFetchResponse<ContactInformationResponse["data"], never, true>(
    "/contact/info",
    {
      method: "PATCH",
      json: payload,
    },
  );
}
