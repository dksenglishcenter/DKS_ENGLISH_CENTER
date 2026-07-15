import { apiFetch } from "@/lib/api/client";
import { toSearchParams } from "@/lib/api/query";
import type {
  FacilityImage,
  FacilityImagePayload,
  ListFacilityImagesParams,
} from "./types";

export async function listFacilityImages(params: ListFacilityImagesParams = {}) {
  return apiFetch<{ images: FacilityImage[] }>(
    `/facility-images${toSearchParams({ publishedOnly: params.publishedOnly })}`,
    { method: "GET" },
  );
}

export async function createFacilityImage(payload: FacilityImagePayload) {
  return apiFetch<{ message: string; image: FacilityImage }>("/facility-images", {
    method: "POST",
    json: payload,
  });
}

export async function updateFacilityImage(
  id: string,
  payload: Partial<FacilityImagePayload>,
) {
  return apiFetch<{ message: string; image: FacilityImage }>(
    `/facility-images/${id}`,
    { method: "PATCH", json: payload },
  );
}

export async function deleteFacilityImage(id: string) {
  return apiFetch<{ message: string }>(`/facility-images/${id}`, {
    method: "DELETE",
  });
}
