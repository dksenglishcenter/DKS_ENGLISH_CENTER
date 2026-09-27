import { DEFAULT_ZALO_URL } from "@/lib/contact-defaults";
import { resolveCenterZaloChatUrl } from "@/lib/contact/messaging-links";

export type SocialNetwork = "zalo" | "facebook" | "youtube" | "tiktok";

const ZALO_CONTACT_URL = resolveCenterZaloChatUrl({
  explicitUrl: process.env.NEXT_PUBLIC_ZALO_CONTACT_URL?.trim() || DEFAULT_ZALO_URL,
  oaUsername: process.env.NEXT_PUBLIC_ZALO_OA_USERNAME?.trim(),
  phone: process.env.NEXT_PUBLIC_ZALO_CONTACT_PHONE?.trim(),
});

export const SOCIAL_LINKS: Record<SocialNetwork, string> = {
  zalo: ZALO_CONTACT_URL,
  facebook: "https://www.facebook.com/profile.php?id=61577630531878",
  youtube: "https://www.youtube.com/",
  tiktok: "https://www.tiktok.com/",
};
