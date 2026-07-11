import { apiFetch } from "@/lib/api/client";
import type { ContactFormPayload, ContactFormResponse } from "./types";

export async function submitContactForm(payload: ContactFormPayload) {
  return apiFetch<ContactFormResponse>("/contact", {
    method: "POST",
    json: payload,
  });
}
