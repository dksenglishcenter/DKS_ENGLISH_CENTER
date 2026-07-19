import type { CookieOptions } from "express";

/** Tên cookie session — backend set, browser gửi lại tự động. */
export const AUTH_COOKIE_NAMES = {
  accessToken: "dks_access_token",
  refreshToken: "dks_refresh_token",
} as const;

const isProduction = process.env.NODE_ENV === "production";

/**
 * FE (Vercel) + BE (Render) = cross-site → bắt buộc SameSite=None + Secure
 * thì cookie mới được gửi kèm fetch credentials.
 * Localhost same-site → Lax.
 *
 * Có thể ép bằng COOKIE_SAME_SITE=none|lax
 */
function resolveSameSite(): "lax" | "none" {
  const forced = process.env.COOKIE_SAME_SITE?.toLowerCase();
  if (forced === "none" || forced === "lax") return forced;

  if (!isProduction) return "lax";

  const frontendUrl = process.env.FRONTEND_URL;
  if (!frontendUrl) return "none";

  try {
    const feHost = new URL(frontendUrl).hostname;
    // Render / khác domain FE → cross-site
    const beHost = process.env.RENDER_EXTERNAL_HOSTNAME
      ?? process.env.COOKIE_DOMAIN_HINT
      ?? "";
    if (beHost && feHost !== beHost) return "none";
  } catch {
    // ignore parse errors
  }

  // Production default: FE/BE thường tách domain
  return "none";
}

/** Cấu hình httpOnly cookie — không cho JS frontend đọc token. */
export function getAuthCookieOptions(
  maxAgeMs?: number,
): CookieOptions {
  const sameSite = resolveSameSite();
  const options: CookieOptions = {
    httpOnly: true,
    // SameSite=None bắt buộc Secure
    secure: isProduction || sameSite === "none",
    sameSite,
    path: "/",
  };
  if (typeof maxAgeMs === "number") {
    options.maxAge = maxAgeMs;
  }
  return options;
}

export function getAccessTokenCookieOptions(): CookieOptions {
  return getAuthCookieOptions(15 * 60 * 1000);
}

/** rememberMe: 30 ngày; không: cookie phiên (hết khi đóng browser). */
export function getRefreshTokenCookieOptions(rememberMe = false): CookieOptions {
  if (rememberMe) {
    return getAuthCookieOptions(30 * 24 * 60 * 60 * 1000);
  }
  return getAuthCookieOptions();
}

export function getClearAuthCookieOptions(): CookieOptions {
  const sameSite = resolveSameSite();
  return {
    httpOnly: true,
    secure: isProduction || sameSite === "none",
    sameSite,
    path: "/",
    maxAge: 0,
  };
}
