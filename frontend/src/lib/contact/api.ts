import { apiFetch } from "@/lib/api/client";
import { CONTACT_INFORMATION_CACHE_TAG } from "./constants";
import { parseContactInformationResponse } from "./validation";
import type {
  ContactFormPayload,
  ContactFormResponse,
  ContactInformationPayload,
  ContactInformationResponse,
} from "./types";

const CONTACT_REQUEST_TIMEOUT_MS = 5_000;

type GetContactInformationOptions = {
  revalidate?: number;
};

export async function submitContactForm(payload: ContactFormPayload) {
  return apiFetch<ContactFormResponse>("/contact", {
    method: "POST",
    json: payload,
  });
}

export async function getContactInformation(
  options: GetContactInformationOptions = {},
) {
  const response = await apiFetch<unknown>("/contact/info", {
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

  return parseContactInformationResponse(response);
}

export async function replaceContactInformation(
  payload: ContactInformationPayload,
) {
  return apiFetch<
    ContactInformationResponse & { message: string }
  >("/contact/info", {
    method: "PUT",
    json: payload,
  });
}

export async function updateContactInformation(
  payload: Partial<ContactInformationPayload>,
) {
  return apiFetch<
    ContactInformationResponse & { message: string }
  >("/contact/info", {
    method: "PATCH",
    json: payload,
  });
}
