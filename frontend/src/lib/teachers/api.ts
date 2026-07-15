import { apiFetch } from "@/lib/api/client";
import { toSearchParams } from "@/lib/api/query";
import type { ListTeachersParams, Teacher, TeacherPayload } from "./types";

export async function listTeachers(params: ListTeachersParams = {}) {
  return apiFetch<{ teachers: Teacher[] }>(
    `/teachers${toSearchParams({ publishedOnly: params.publishedOnly })}`,
    { method: "GET" },
  );
}

export async function createTeacher(payload: TeacherPayload) {
  return apiFetch<{ message: string; teacher: Teacher }>("/teachers", {
    method: "POST",
    json: payload,
  });
}

export async function updateTeacher(id: string, payload: Partial<TeacherPayload>) {
  return apiFetch<{ message: string; teacher: Teacher }>(`/teachers/${id}`, {
    method: "PATCH",
    json: payload,
  });
}

export async function deleteTeacher(id: string) {
  return apiFetch<{ message: string }>(`/teachers/${id}`, {
    method: "DELETE",
  });
}
