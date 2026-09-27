export const DEFAULT_ZALO_PHONE = '0834513456';

export const DEFAULT_ZALO_OA_USERNAME =
  process.env.ZALO_OA_USERNAME?.trim() || '';

export const DEFAULT_ZALO_URL =
  process.env.ZALO_CONTACT_URL?.trim() ||
  (DEFAULT_ZALO_OA_USERNAME
    ? `https://zalo.me/${DEFAULT_ZALO_OA_USERNAME.replace(/^@/, '')}`
    : `https://zalo.me/${DEFAULT_ZALO_PHONE}`);
