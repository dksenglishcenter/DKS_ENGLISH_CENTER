import { apiFetch } from "@/lib/api/client";
import { toSearchParams } from "@/lib/api/query";
import type {
  ListSuccessStoriesParams,
  SuccessStory,
  SuccessStoryPayload,
} from "./types";

export async function listSuccessStories(params: ListSuccessStoriesParams = {}) {
  return apiFetch<{ stories: SuccessStory[] }>(
    `/success-stories${toSearchParams({ publishedOnly: params.publishedOnly })}`,
    { method: "GET" },
  );
}

export async function createSuccessStory(payload: SuccessStoryPayload) {
  return apiFetch<{ message: string; story: SuccessStory }>("/success-stories", {
    method: "POST",
    json: payload,
  });
}

export async function updateSuccessStory(
  id: string,
  payload: Partial<SuccessStoryPayload>,
) {
  return apiFetch<{ message: string; story: SuccessStory }>(
    `/success-stories/${id}`,
    { method: "PATCH", json: payload },
  );
}

export async function deleteSuccessStory(id: string) {
  return apiFetch<{ message: string }>(`/success-stories/${id}`, {
    method: "DELETE",
  });
}
