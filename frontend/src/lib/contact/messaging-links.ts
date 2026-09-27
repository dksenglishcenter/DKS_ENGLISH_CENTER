/**
 * Deep link chat Zalo / WhatsApp.
 * Zalo: ưu tiên OA username (env), không thì số điện thoại dạng zalo.me/0xxxxxxxxx
 * — kích hoạt hộp thoại “Mở Zalo?” thay vì trang login QR khi có app.
 */

const DIGITS = /\D/g;

/** Chuẩn hoá SĐT VN → dạng quốc tế không dấu + (84…). */
export function toVietnamE164Digits(phone: string): string {
  const raw = phone.replace(DIGITS, "");
  if (!raw) return "";
  if (raw.startsWith("84")) return raw;
  if (raw.startsWith("0")) return `84${raw.slice(1)}`;
  return raw;
}

/** Giữ dạng 0xxxxxxxxx cho zalo.me (ổn định hơn với user VN). */
export function toZaloPhonePath(phone: string): string {
  const raw = phone.replace(DIGITS, "");
  if (!raw) return "";
  if (raw.startsWith("84") && raw.length >= 11) return `0${raw.slice(2)}`;
  return raw;
}

export function getWhatsAppHref(phone: string, text?: string): string {
  const digits = toVietnamE164Digits(phone);
  if (!digits) return "#";
  const base = `https://wa.me/${digits}`;
  if (!text?.trim()) return base;
  return `${base}?text=${encodeURIComponent(text.trim())}`;
}

export function getZaloChatHrefFromPhone(phone: string): string {
  const path = toZaloPhonePath(phone);
  return path ? `https://zalo.me/${path}` : "#";
}

/**
 * Link Chat Zalo của trung tâm.
 * 1) NEXT_PUBLIC_ZALO_CONTACT_URL / ZALO_CONTACT_URL nếu là URL đầy đủ
 * 2) NEXT_PUBLIC_ZALO_OA_USERNAME → https://zalo.me/<username>
 * 3) fallback SĐT
 */
export function resolveCenterZaloChatUrl(options?: {
  explicitUrl?: string | null;
  oaUsername?: string | null;
  phone?: string | null;
}): string {
  const explicit = options?.explicitUrl?.trim();
  if (explicit) {
    if (/^https?:\/\//i.test(explicit)) return explicit;
    // Cho phép ghi username trần trong env
    return `https://zalo.me/${explicit.replace(/^@/, "")}`;
  }

  const oa = options?.oaUsername?.trim().replace(/^@/, "");
  if (oa) return `https://zalo.me/${oa}`;

  const phone = options?.phone?.trim();
  if (phone) return getZaloChatHrefFromPhone(phone);

  return "https://zalo.me/0834513456";
}
