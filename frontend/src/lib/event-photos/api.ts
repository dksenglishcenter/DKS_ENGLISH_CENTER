import { apiFetch } from "@/lib/api/client";
import { toSearchParams } from "@/lib/api/query";
import type {
  EventPhoto,
  EventPhotoPayload,
  ListEventPhotosParams,
} from "./types";

export async function listEventPhotos(params: ListEventPhotosParams = {}) {
  return apiFetch<{ images: EventPhoto[] }>(
    `/event-photos${toSearchParams({ publishedOnly: params.publishedOnly })}`,
    { method: "GET" },
  );
}

export async function createEventPhoto(payload: EventPhotoPayload) {
  return apiFetch<{ message: string; image: EventPhoto }>("/event-photos", {
    method: "POST",
    json: payload,
  });
}

export async function updateEventPhoto(
  id: string,
  payload: Partial<EventPhotoPayload>,
) {
  return apiFetch<{ message: string; image: EventPhoto }>(
    `/event-photos/${id}`,
    { method: "PATCH", json: payload },
  );
}

export async function deleteEventPhoto(id: string) {
  return apiFetch<{ message: string }>(`/event-photos/${id}`, {
    method: "DELETE",
  });
}
