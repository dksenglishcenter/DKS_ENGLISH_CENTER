/** Zalo defaults — override via NEXT_PUBLIC_ZALO_* / ZALO_* env. */
export const DEFAULT_ZALO_PHONE = "0834513456";

/** OA / username nếu có (vd. dksenglish) — ưu tiên hơn SĐT để mở chat đúng. */
export const DEFAULT_ZALO_OA_USERNAME =
  process.env.NEXT_PUBLIC_ZALO_OA_USERNAME?.trim() ||
  process.env.ZALO_OA_USERNAME?.trim() ||
  "";

export const DEFAULT_ZALO_URL =
  process.env.NEXT_PUBLIC_ZALO_CONTACT_URL?.trim() ||
  process.env.ZALO_CONTACT_URL?.trim() ||
  (DEFAULT_ZALO_OA_USERNAME
    ? `https://zalo.me/${DEFAULT_ZALO_OA_USERNAME.replace(/^@/, "")}`
    : `https://zalo.me/${DEFAULT_ZALO_PHONE}`);
