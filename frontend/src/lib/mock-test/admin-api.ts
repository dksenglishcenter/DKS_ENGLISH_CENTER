import { apiFetch } from "@/lib/api/client";
import type { ExamSkill } from "./types";

export type AdminExam = {
  id: string;
  code: string;
  title: string;
  skill: ExamSkill;
  durationMinutes: number;
  isPublished: boolean;
  createdAt: string;
  questionCount: number;
};

export async function listAllExams() {
  const { tests } = await apiFetch<{ tests: AdminExam[] }>(
    "/mock-tests/admin",
    { method: "GET" },
  );
  return tests;
}

export function importExam(payload: unknown) {
  return apiFetch<{ message: string; test: { id: string; code: string; title: string } }>(
    "/mock-tests/admin/import",
    { method: "POST", json: payload },
  );
}

export function setExamPublished(id: string, isPublished: boolean) {
  return apiFetch(`/mock-tests/admin/${id}/publish`, {
    method: "PATCH",
    json: { isPublished },
  });
}

export function deleteExam(id: string) {
  return apiFetch(`/mock-tests/admin/${id}`, { method: "DELETE" });
}
