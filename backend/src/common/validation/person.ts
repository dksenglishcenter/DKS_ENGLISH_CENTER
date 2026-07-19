/** Keep in sync with frontend lib/validation/person.ts */

export const NAME_PATTERN = /^[\p{L}\p{M}][\p{L}\p{M}\s.'’-]*$/u;
export const PHONE_PATTERN = /^(?=(?:\D*\d){8,15}\D*$)[+\d][\d\s().-]*$/;
export const EMAIL_PATTERN = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;
export const NO_HTML_BRACKETS = /^[^<>]*$/;
