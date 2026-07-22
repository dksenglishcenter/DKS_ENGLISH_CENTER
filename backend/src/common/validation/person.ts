/** Keep in sync with frontend lib/validation/person.ts */

export const NAME_PATTERN = /^[\p{L}\p{M}][\p{L}\p{M}\s.'’-]*$/u;
/** Chỉ +, số, khoảng trắng và () . - ; tối thiểu 8 chữ số. */
export const PHONE_PATTERN = /^(?=(?:\D*\d){8,15}\D*$)[+\d][\d\s().-]*$/;
export const EMAIL_PATTERN = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;
export const NO_HTML_BRACKETS = /^[^<>]*$/;
/** Có chữ + số, không khoảng trắng. */
export const PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*\d)\S{8,72}$/;
export const PASSWORD_MESSAGE =
  'Mật khẩu phải có 8–72 ký tự, gồm chữ và số, không chứa khoảng trắng.';
