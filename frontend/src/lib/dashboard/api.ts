import { apiFetch } from "@/lib/api/client";
import type { AdminDashboardStats } from "./types";

export async function getAdminDashboardStats() {
  return apiFetch<{ stats: AdminDashboardStats }>("/dashboard/stats", {
    method: "GET",
  });
}
