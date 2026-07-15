import { apiFetch } from "@/lib/api/client";
import { toSearchParams } from "@/lib/api/query";
import type { Course, CoursePayload, ListCoursesParams } from "./types";

export async function listCourses(params: ListCoursesParams = {}) {
  return apiFetch<{ courses: Course[] }>(
    `/courses${toSearchParams({
      featured: params.featured,
      category: params.category,
      publishedOnly: params.publishedOnly,
    })}`,
    { method: "GET" },
  );
}

export async function getCourseBySlug(slug: string) {
  return apiFetch<{ course: Course }>(`/courses/${slug}`, {
    method: "GET",
  });
}

export async function createCourse(payload: CoursePayload) {
  return apiFetch<{ message: string; course: Course }>("/courses", {
    method: "POST",
    json: payload,
  });
}

export async function updateCourse(id: string, payload: Partial<CoursePayload>) {
  return apiFetch<{ message: string; course: Course }>(`/courses/${id}`, {
    method: "PATCH",
    json: payload,
  });
}

export async function deleteCourse(id: string) {
  return apiFetch<{ message: string }>(`/courses/${id}`, {
    method: "DELETE",
  });
}
