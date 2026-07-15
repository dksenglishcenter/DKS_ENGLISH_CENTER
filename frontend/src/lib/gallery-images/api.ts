import { apiFetch } from "@/lib/api/client";
import { toSearchParams } from "@/lib/api/query";
import type {
  GalleryImage,
  GalleryImagePayload,
  ListGalleryImagesParams,
} from "./types";

export async function listGalleryImages(params: ListGalleryImagesParams = {}) {
  return apiFetch<{ images: GalleryImage[] }>(
    `/gallery-images${toSearchParams({ publishedOnly: params.publishedOnly })}`,
    { method: "GET" },
  );
}

export async function createGalleryImage(payload: GalleryImagePayload) {
  return apiFetch<{ message: string; image: GalleryImage }>("/gallery-images", {
    method: "POST",
    json: payload,
  });
}

export async function updateGalleryImage(
  id: string,
  payload: Partial<GalleryImagePayload>,
) {
  return apiFetch<{ message: string; image: GalleryImage }>(
    `/gallery-images/${id}`,
    { method: "PATCH", json: payload },
  );
}

export async function deleteGalleryImage(id: string) {
  return apiFetch<{ message: string }>(`/gallery-images/${id}`, {
    method: "DELETE",
  });
}
