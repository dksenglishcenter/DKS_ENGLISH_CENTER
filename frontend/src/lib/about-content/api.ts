import { apiFetch } from "@/lib/api/client";
import type { AboutPageContent } from "./types";

export async function getAboutContent() {
  return apiFetch<{ content: AboutPageContent }>("/about-content", {
    method: "GET",
  });
}

export async function updateAboutContent(payload: { visionImageUrl: string }) {
  return apiFetch<{ message: string; content: AboutPageContent }>("/about-content", {
    method: "PATCH",
    json: payload,
  });
}
