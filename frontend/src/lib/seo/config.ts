export const siteConfig = {
  name: "DKS English Center",
  legalName: "DKS English Center",
  tagline: "Học đúng cách – Tiến xa mỗi ngày",
  description:
    "Trung tâm tiếng Anh DKS — luyện thi IELTS, giao tiếp, gia sư 1-1. Giáo viên chuẩn quốc tế, lộ trình cá nhân hóa tại TP. Hồ Chí Minh.",
  locale: "vi_VN",
  language: "vi",
  email: "contact@dksenglish.vn",
  phone: "+84-xxx-xxx-xxxx",
  address: {
    streetAddress: "TP. Hồ Chí Minh",
    addressLocality: "Ho Chi Minh City",
    addressCountry: "VN",
  },
} as const;

export function getSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
}
