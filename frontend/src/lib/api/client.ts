import { getApiUrl } from "./config";
import { parseApiErrorBody } from "@/lib/errors/format-error";

type ApiFetchOptions = RequestInit & {
  /** JSON body — tự stringify và set Content-Type. */
  json?: unknown;
};

/**
 * Gọi API backend với session httpOnly cookie.
 * Không dùng localStorage/sessionStorage và không gửi Authorization: Bearer.
 * Trình duyệt tự gửi cookie khi credentials: "include".
 */
export async function apiFetch<T = unknown>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const { json, headers, ...init } = options;
  const url = path.startsWith("http") ? path : `${getApiUrl()}${path.startsWith("/") ? path : `/${path}`}`;

  const response = await fetch(url, {
    ...init,
    credentials: "include",
    headers: {
      ...(json !== undefined ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    body: json !== undefined ? JSON.stringify(json) : init.body,
  });

  if (!response.ok) {
    const raw = await response.text().catch(() => response.statusText);
    throw parseApiErrorBody(raw, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
