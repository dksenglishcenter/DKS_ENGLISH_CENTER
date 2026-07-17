import type { ContactInformation, ContactInformationPayload } from "./types";

const PHONE_PATTERN = /^(?=(?:\D*\d){7,15}\D*$)[+\d][\d\s().-]*$/;
const GOOGLE_MAPS_URL_PATTERN =
  /^https:\/\/(?:(?:www\.)?google\.com\/maps(?!\/embed(?:[/?#]|$))(?:[/?#].*)?|maps\.google\.com(?!\/embed(?:[/?#]|$))(?:[/?#].*)?|maps\.app\.goo\.gl\/[A-Za-z0-9_-]+(?:[/?#].*)?|goo\.gl\/maps\/[A-Za-z0-9_-]+(?:[/?#].*)?)$/i;
const GOOGLE_MAPS_EMBED_URL_PATTERN =
  /^https:\/\/(?:(?:www\.)?google\.com\/maps\/embed(?:[/?#]|$)|maps\.google\.com\/embed(?:[/?#]|$))/i;

export type ContactInformationField = keyof ContactInformationPayload;
export type ContactInformationErrors = Partial<
  Record<ContactInformationField, string>
>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function isGoogleMapsUrl(value: string) {
  if (!GOOGLE_MAPS_URL_PATTERN.test(value)) return false;

  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

function isGoogleMapsEmbedUrl(value: string) {
  return GOOGLE_MAPS_EMBED_URL_PATTERN.test(value);
}

export function validateContactInformation(
  values: ContactInformationPayload,
): ContactInformationErrors {
  const errors: ContactInformationErrors = {};
  const phone = values.phone.trim();
  const email = values.email.trim();
  const address = values.address.trim();
  const hours = values.hours.trim();
  const mapUrl = values.mapUrl.trim();

  if (!PHONE_PATTERN.test(phone) || phone.length > 20) {
    errors.phone = "Số điện thoại cần có 7–15 chữ số và đúng định dạng.";
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 255) {
    errors.email = "Email chưa đúng định dạng.";
  }
  if (!address || address.length > 500) {
    errors.address = "Địa chỉ là bắt buộc và tối đa 500 ký tự.";
  }
  if (!hours || hours.length > 255) {
    errors.hours = "Giờ làm việc là bắt buộc và tối đa 255 ký tự.";
  }
  if (!mapUrl) {
    errors.mapUrl = "Google Maps URL là bắt buộc.";
  } else if (isGoogleMapsEmbedUrl(mapUrl)) {
    errors.mapUrl =
      "Không sử dụng link Nhúng. Hãy sao chép link từ mục Chia sẻ.";
  } else if (!isGoogleMapsUrl(mapUrl) || mapUrl.length > 2048) {
    errors.mapUrl = "Chỉ chấp nhận URL HTTPS của Google Maps.";
  }

  return errors;
}

export function parseContactInformationResponse(
  value: unknown,
): ContactInformation {
  if (!isRecord(value)) {
    throw new Error("Phản hồi thông tin liên hệ không đúng cấu trúc.");
  }

  const raw = value;
  const requiredFields: Array<keyof ContactInformation> = [
    "id",
    "phone",
    "email",
    "address",
    "hours",
    "mapUrl",
    "updatedAt",
  ];

  if (requiredFields.some((field) => !isNonEmptyString(raw[field]))) {
    throw new Error("Phản hồi thông tin liên hệ bị thiếu dữ liệu bắt buộc.");
  }

  const contactInfo: ContactInformation = {
    id: raw.id as string,
    phone: raw.phone as string,
    email: raw.email as string,
    address: raw.address as string,
    hours: raw.hours as string,
    mapUrl: raw.mapUrl as string,
    updatedAt: raw.updatedAt as string,
  };
  const validationErrors = validateContactInformation(contactInfo);

  if (Object.keys(validationErrors).length > 0) {
    throw new Error("Phản hồi thông tin liên hệ chứa dữ liệu không hợp lệ.");
  }

  return contactInfo;
}

export function getPhoneHref(phone: string) {
  return `tel:${phone.replace(/[^+\d]/g, "")}`;
}
