import type { CookieOptions } from "express";

/** Tên cookie session — backend set, browser gửi lại tự động. */
export const AUTH_COOKIE_NAMES = {
  accessToken: "dks_access_token",
  refreshToken: "dks_refresh_token",
} as const;

const isProduction = process.env.NODE_ENV === "production";

/** Cấu hình httpOnly cookie — không cho JS frontend đọc token. */
export function getAuthCookieOptions(maxAgeMs: number): CookieOptions {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: maxAgeMs,
  };
}

export function getAccessTokenCookieOptions(): CookieOptions {
  return getAuthCookieOptions(15 * 60 * 1000);
}

export function getRefreshTokenCookieOptions(): CookieOptions {
  return getAuthCookieOptions(7 * 24 * 60 * 60 * 1000);
}

export function getClearAuthCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  };
}
