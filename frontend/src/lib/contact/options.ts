/** Vai trò người gửi form Liên hệ — khớp feedback PDF. */
export const CONTACT_SENDER_ROLES = [
  { value: "hoc-sinh-cap-1", label: "Học sinh cấp 1" },
  { value: "hoc-sinh-cap-2", label: "Học sinh cấp 2" },
  { value: "hoc-sinh-cap-3", label: "Học sinh cấp 3" },
  { value: "phu-huynh", label: "Phụ huynh" },
  { value: "sinh-vien", label: "Sinh viên" },
  { value: "nguoi-di-lam", label: "Người đi làm" },
  { value: "khac", label: "Khác" },
] as const;

export type ContactSenderRole =
  (typeof CONTACT_SENDER_ROLES)[number]["value"];

/** Kênh muốn DKS liên hệ lại. */
export const CONTACT_CHANNELS = [
  { value: "phone", label: "Gọi điện" },
  { value: "zalo", label: "Zalo" },
  { value: "whatsapp", label: "WhatsApp" },
] as const;

export type ContactChannel = (typeof CONTACT_CHANNELS)[number]["value"];

export const CONTACT_OTHER_COURSE = "Khác";

export function contactSenderRoleLabel(value: string | null | undefined) {
  return (
    CONTACT_SENDER_ROLES.find((item) => item.value === value)?.label ??
    value ??
    "—"
  );
}

export function contactChannelLabel(value: string | null | undefined) {
  return (
    CONTACT_CHANNELS.find((item) => item.value === value)?.label ??
    value ??
    "—"
  );
}
