const DATE_TIME_FORMATTER = new Intl.DateTimeFormat("vi-VN", {
  dateStyle: "short",
  timeStyle: "short",
});

const DATE_FORMATTER = new Intl.DateTimeFormat("vi-VN", {
  dateStyle: "short",
  timeZone: "UTC",
});

export function formatAdminDateTime(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Không rõ"
    : DATE_TIME_FORMATTER.format(date);
}

/** Ngày không kèm giờ (dùng cho field date-only như publishedAt). */
export function formatAdminDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Không rõ"
    : DATE_FORMATTER.format(date);
}
