import { apiFetch } from "@/lib/api/client";
import type {
  CreateUserPayload,
  ListUsersOptions,
  ManagedUser,
  UserPayload,
  UsersMeta,
} from "./types";

export function listUsers({
  page = 1,
  pageSize = 10,
  search,
  role,
  signal,
}: ListUsersOptions = {}) {
  const query = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });
  if (search) query.set("search", search);
  if (role) query.set("role", role);

  return apiFetch<{ data: ManagedUser[]; meta: UsersMeta }>(
    `/users?${query.toString()}`,
    { method: "GET", cache: "no-store", signal },
  );
}

export function createUser(payload: CreateUserPayload) {
  return apiFetch<{ message: string; data: ManagedUser }>("/users", {
    method: "POST",
    json: payload,
  });
}

export function updateUser(id: string, payload: Partial<UserPayload>) {
  return apiFetch<{ message: string; data: ManagedUser }>(`/users/${id}`, {
    method: "PATCH",
    json: payload,
  });
}

export function deleteUser(id: string) {
  return apiFetch<{ message: string }>(`/users/${id}`, {
    method: "DELETE",
  });
}
