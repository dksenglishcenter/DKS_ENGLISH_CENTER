export const siteConfig = {
  name: "DKS English Center",
  legalName: "DKS English Center",
  tagline: "Học đúng cách – Tiến xa mỗi ngày",
  description:
    "Trung tâm tiếng Anh DKS tại Vĩnh Tuy, Hai Bà Trưng, Hà Nội — dạy tiếng Anh cho học sinh lớp 1 đến lớp 9 theo chương trình Global Success, luyện thi vào lớp 10. Lớp sĩ số nhỏ, giáo viên tận tâm.",
  locale: "vi_VN",
  language: "vi",
  email: "dksenglishcenter@gmail.com",
  phone: "+84-83-451-3456",
  address: {
    streetAddress: "63 Ngõ 120 Dương Văn Bé, Vĩnh Tuy",
    addressLocality: "Hai Bà Trưng, Hà Nội",
    addressRegion: "Hà Nội",
    postalCode: "11622",
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
