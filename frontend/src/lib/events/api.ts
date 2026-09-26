import { apiFetch } from "@/lib/api/client";
import { toSearchParams } from "@/lib/api/query";
import type { EventItem, EventPayload, ListEventsParams } from "./types";

export async function listEvents(params: ListEventsParams = {}) {
  return apiFetch<{ events: EventItem[] }>(
    `/events${toSearchParams({ publishedOnly: params.publishedOnly })}`,
    { method: "GET" },
  );
}

export async function createEvent(payload: EventPayload) {
  return apiFetch<{ message: string; event: EventItem }>("/events", {
    method: "POST",
    json: payload,
  });
}

export async function updateEvent(id: string, payload: Partial<EventPayload>) {
  return apiFetch<{ message: string; event: EventItem }>(`/events/${id}`, {
    method: "PATCH",
    json: payload,
  });
}

export async function deleteEvent(id: string) {
  return apiFetch<{ message: string }>(`/events/${id}`, {
    method: "DELETE",
  });
}
