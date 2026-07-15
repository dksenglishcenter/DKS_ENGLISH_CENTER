export function getApiUrl(): string {
  const base = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
  if (base) return base;
  // Browser: gọi same-origin /api (Next rewrite → Nest)
  if (typeof window !== "undefined") return "/api";
  return "http://localhost:3001/api";
}
