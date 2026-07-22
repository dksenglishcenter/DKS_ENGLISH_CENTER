/** Shared person/contact field patterns (keep in sync with backend common/validation). */

export const NAME_PATTERN = /^[\p{L}\p{M}][\p{L}\p{M}\s.'’-]*$/u;
export const EMAIL_PATTERN = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;
/** Có chữ + số, không khoảng trắng. */
export const PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*\d)\S{8,72}$/;

export function containsHtmlCharacters(value: string) {
  return /[<>]/.test(value);
}

export function getPasswordValidationError(value: string): string | undefined {
  if (!value) {
    return "Vui lòng nhập mật khẩu.";
  }
  if (/\s/.test(value)) {
    return "Mật khẩu không được chứa khoảng trắng.";
  }
  if (value.length < 8) {
    return "Mật khẩu phải có ít nhất 8 ký tự.";
  }
  if (value.length > 72) {
    return "Mật khẩu không được vượt quá 72 ký tự.";
  }
  if (!PASSWORD_PATTERN.test(value)) {
    return "Mật khẩu phải có 8–72 ký tự, gồm chữ và số, không chứa khoảng trắng.";
  }
  return undefined;
}

export function getNameValidationError(
  value: string,
  options?: { required?: boolean; min?: number; max?: number; requireSpace?: boolean },
): string | undefined {
  const required = options?.required !== false;
  const min = options?.min ?? 2;
  const max = options?.max ?? 100;
  const trimmed = value.trim();

  if (!trimmed) {
    return required ? "Vui lòng nhập họ và tên." : undefined;
  }
  if (containsHtmlCharacters(trimmed)) {
    return "Họ và tên không được chứa thẻ HTML.";
  }
  if (trimmed.length < min) {
    return `Họ và tên phải có ít nhất ${min} ký tự.`;
  }
  if (trimmed.length > max) {
    return `Họ và tên không được vượt quá ${max} ký tự.`;
  }
  if (!NAME_PATTERN.test(trimmed)) {
    return "Họ và tên chỉ được chứa chữ cái, khoảng trắng, dấu chấm, dấu nháy hoặc dấu gạch nối.";
  }
  if (options?.requireSpace && !/\s/.test(trimmed)) {
    return "Vui lòng nhập đầy đủ họ và tên (ví dụ: Nguyễn Văn A).";
  }
  return undefined;
}

export function getEmailValidationError(
  value: string,
  options?: { required?: boolean; max?: number },
): string | undefined {
  const required = options?.required === true;
  const max = options?.max ?? 255;
  const trimmed = value.trim();

  if (!trimmed) {
    return required ? "Vui lòng nhập email." : undefined;
  }
  if (containsHtmlCharacters(trimmed)) {
    return "Email không được chứa thẻ HTML.";
  }
  if (trimmed.length > max) {
    return `Email không được vượt quá ${max} ký tự.`;
  }
  if (!EMAIL_PATTERN.test(trimmed)) {
    return "Vui lòng nhập đúng định dạng email.";
  }
  return undefined;
}
