/**
 * Browser: luôn same-origin `/api` (Next rewrite → Nest).
 * Cookie httpOnly mới gắn đúng domain FE (Vercel) — tránh cross-site
 * vercel.app → onrender.com làm mất session (SameSite).
 *
 * Server (RSC/SSR): gọi thẳng backend URL.
 */
export function getApiUrl(): string {
  if (typeof window !== "undefined") {
    return "/api";
  }

  const fromPublic = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
  if (fromPublic) return fromPublic;

  const backend = process.env.BACKEND_URL?.replace(/\/$/, "");
  if (backend) return `${backend}/api`;

  return "http://localhost:3001/api";
}
