import { getApiUrl } from "./config";
import { parseApiErrorBody } from "@/lib/errors/format-error";

type ApiFetchOptions = RequestInit & {
  /** Cấu hình Data Cache khi fetch chạy trong Next.js server. */
  next?: {
    revalidate?: number | false;
    tags?: string[];
  };
  /** JSON body — tự stringify và set Content-Type. */
  json?: unknown;
  /** Bỏ qua retry refresh (tránh vòng lặp khi gọi /auth/refresh). */
  skipAuthRefresh?: boolean;
};

let refreshInFlight: Promise<boolean> | null = null;

async function tryRefreshSession(): Promise<boolean> {
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = (async () => {
    try {
      const response = await fetch(`${getApiUrl()}/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });
      return response.ok;
    } catch {
      return false;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}

/**
 * Gọi API backend với session httpOnly cookie.
 * Không dùng localStorage/sessionStorage và không gửi Authorization: Bearer.
 * Trình duyệt tự gửi cookie khi credentials: "include".
 * Access hết hạn → tự POST /auth/refresh rồi retry 1 lần.
 */
export async function apiFetch<T = unknown>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const { json, headers, skipAuthRefresh, ...init } = options;
  const url = path.startsWith("http") ? path : `${getApiUrl()}${path.startsWith("/") ? path : `/${path}`}`;
  const isBrowser = typeof window !== "undefined";

  const doFetch = () =>
    fetch(url, {
      ...init,
      // RSC/build không có cookie session — omit tránh quirks undici
      credentials: isBrowser ? "include" : "omit",
      headers: {
        ...(json !== undefined ? { "Content-Type": "application/json" } : {}),
        ...headers,
      },
      body: json !== undefined ? JSON.stringify(json) : init.body,
    });

  let response = await doFetch();

  const isAuthEndpoint =
    path.includes("/auth/login") ||
    path.includes("/auth/register") ||
    path.includes("/auth/refresh") ||
    path.includes("/auth/logout");

  if (
    isBrowser &&
    response.status === 401 &&
    !skipAuthRefresh &&
    !isAuthEndpoint
  ) {
    const refreshed = await tryRefreshSession();
    if (refreshed) {
      response = await doFetch();
    }
  }

  if (!response.ok) {
    const raw = await response.text().catch(() => response.statusText);
    throw parseApiErrorBody(raw, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
