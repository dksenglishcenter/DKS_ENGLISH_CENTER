/** Vai trò người gửi form Liên hệ — khớp feedback PDF. */
export const CONTACT_SENDER_ROLES = [
  { value: 'hoc-sinh-cap-1', label: 'Học sinh cấp 1' },
  { value: 'hoc-sinh-cap-2', label: 'Học sinh cấp 2' },
  { value: 'hoc-sinh-cap-3', label: 'Học sinh cấp 3' },
  { value: 'phu-huynh', label: 'Phụ huynh' },
  { value: 'sinh-vien', label: 'Sinh viên' },
  { value: 'nguoi-di-lam', label: 'Người đi làm' },
  { value: 'khac', label: 'Khác' },
] as const;

export type ContactSenderRole =
  (typeof CONTACT_SENDER_ROLES)[number]['value'];

export const CONTACT_SENDER_ROLE_VALUES = CONTACT_SENDER_ROLES.map(
  (item) => item.value,
) as [ContactSenderRole, ...ContactSenderRole[]];

/** Kênh muốn DKS liên hệ lại. */
export const CONTACT_CHANNELS = [
  { value: 'phone', label: 'Gọi điện' },
  { value: 'zalo', label: 'Zalo' },
  { value: 'whatsapp', label: 'WhatsApp' },
] as const;

export type ContactChannel = (typeof CONTACT_CHANNELS)[number]['value'];

export const CONTACT_CHANNEL_VALUES = CONTACT_CHANNELS.map(
  (item) => item.value,
) as [ContactChannel, ...ContactChannel[]];

export const CONTACT_OTHER_COURSE = 'Khác';

export function isContactSenderRole(value: string): value is ContactSenderRole {
  return (CONTACT_SENDER_ROLE_VALUES as string[]).includes(value);
}

export function isContactChannel(value: string): value is ContactChannel {
  return (CONTACT_CHANNEL_VALUES as string[]).includes(value);
}

export function contactSenderRoleLabel(value: string | null | undefined) {
  return (
    CONTACT_SENDER_ROLES.find((item) => item.value === value)?.label ??
    value ??
    '—'
  );
}

export function contactChannelLabel(value: string | null | undefined) {
  return (
    CONTACT_CHANNELS.find((item) => item.value === value)?.label ??
    value ??
    '—'
  );
}
