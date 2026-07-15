/**
 * Browser: luôn same-origin `/api` (Next rewrite → Nest) — cookie auth đúng domain FE.
 * Server (RSC/build): gọi thẳng backend hoặc qua absolute FE URL.
 */
export function getApiUrl(): string {
  if (typeof window !== "undefined") {
    return "/api";
  }

  const backend = process.env.BACKEND_URL?.replace(/\/$/, "");
  if (backend) {
    return backend.endsWith("/api") ? backend : `${backend}/api`;
  }

  const publicApi = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
  if (publicApi) return publicApi;

  // Prefers Vercel deployment URL (preview/prod) → đi rewrite /api
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}/api`;
  }

  const site = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (site) return `${site}/api`;

  return "http://localhost:3001/api";
}
