import { apiFetch } from "@/lib/api/client";
import type { CareerApplicationPayload, CareerApplicationResponse } from "./types";

export async function submitCareerApplication(payload: CareerApplicationPayload) {
  return apiFetch<CareerApplicationResponse>("/careers", {
    method: "POST",
    json: payload,
  });
}
