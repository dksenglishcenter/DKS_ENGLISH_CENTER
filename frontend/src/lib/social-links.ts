export type SocialNetwork = "zalo" | "facebook" | "youtube" | "tiktok";

/** Mặc định trùng ZALO_CONTACT_URL phía backend. */
const ZALO_CONTACT_URL =
  process.env.NEXT_PUBLIC_ZALO_CONTACT_URL?.trim() ||
  "https://zalo.me/0834513456";

export const SOCIAL_LINKS: Record<SocialNetwork, string> = {
  zalo: ZALO_CONTACT_URL,
  facebook: "https://www.facebook.com/profile.php?id=61577630531878",
  youtube: "https://www.youtube.com/",
  tiktok: "https://www.tiktok.com/",
};
