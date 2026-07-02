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

/** Chuẩn hóa URL site: bỏ slash cuối, thêm https nếu thiếu protocol. */
export function normalizeSiteUrl(raw: string): string {
  const trimmed = raw.trim().replace(/\/$/, "");
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

export function getSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);
  }

  // Vercel tự inject — chỉ hostname, không có https:// (vd: project.vercel.app)
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return normalizeSiteUrl(process.env.VERCEL_PROJECT_PRODUCTION_URL);
  }

  // URL deployment preview — không dùng cho production SEO
  if (process.env.VERCEL_URL) {
    return normalizeSiteUrl(process.env.VERCEL_URL);
  }

  return "http://localhost:3000";
}
