export function getApiUrl(): string {
  const base = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
  return base ?? "http://localhost:3001/api";
}
