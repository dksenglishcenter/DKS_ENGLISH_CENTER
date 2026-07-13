export const PHONE_LIMITS = {
  minDigits: 8,
  maxDigits: 15,
} as const;

export function sanitizePhoneInput(value: string) {
  const trimmed = value.trimStart();
  const hasPlus = trimmed.startsWith("+");
  const digits = value.replace(/\D/g, "").slice(0, PHONE_LIMITS.maxDigits);

  return hasPlus ? `+${digits}` : digits;
}

export function getPhoneValidationError(value: string): string | undefined {
  const digits = value.replace(/\D/g, "");

  if (!digits) {
    return "Vui lòng nhập số điện thoại.";
  }

  if (digits.length < PHONE_LIMITS.minDigits) {
    return `Số điện thoại phải có ít nhất ${PHONE_LIMITS.minDigits} chữ số.`;
  }

  if (digits.length > PHONE_LIMITS.maxDigits) {
    return `Số điện thoại không được vượt quá ${PHONE_LIMITS.maxDigits} chữ số.`;
  }

  return undefined;
}

export function normalizePhone(value: string) {
  const digits = value.replace(/\D/g, "");
  const trimmed = value.trim();

  if (trimmed.startsWith("+")) {
    return `+${digits}`;
  }

  return digits;
}
