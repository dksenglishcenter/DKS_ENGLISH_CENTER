export const CLOUDINARY_FOLDERS = {
  brandLogo: "dks-english-center/brand/logo",
  social: "dks-english-center/social",
  homeGallery: "dks-english-center/home/gallery",
} as const;

export const SOCIAL_PLATFORMS = ["zalo", "facebook", "youtube", "tiktok"] as const;

export type SocialPlatform = (typeof SOCIAL_PLATFORMS)[number];
export type MediaCategory = "brand-logo" | "social-icon" | "home-gallery";

export type UploadMediaResponse = {
  message: string;
  url: string;
  publicId: string;
  folder: string;
  width: number;
  height: number;
  format: string;
};

export async function uploadMediaAsset(
  file: File,
  options: { category: MediaCategory; platform?: SocialPlatform; publicId?: string },
): Promise<UploadMediaResponse> {
  const { getApiUrl } = await import("@/lib/api/config");
  const formData = new FormData();
  formData.append("file", file);
  formData.append("category", options.category);
  if (options.platform) {
    formData.append("platform", options.platform);
  }
  if (options.publicId) {
    formData.append("publicId", options.publicId);
  }

  const response = await fetch(`${getApiUrl()}/media/upload`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  if (!response.ok) {
    const { parseApiErrorBody } = await import("@/lib/errors/format-error");
    const raw = await response.text().catch(() => response.statusText);
    throw parseApiErrorBody(raw, response.status);
  }

  return response.json() as Promise<UploadMediaResponse>;
}
