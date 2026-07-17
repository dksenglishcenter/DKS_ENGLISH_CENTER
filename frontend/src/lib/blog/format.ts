const BLOG_DATE_FORMATTER = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "UTC",
});

/** publishedAt là date-only (YYYY-MM-DD) — format theo UTC để không lệch ngày. */
export function formatBlogDate(dateOnly: string) {
  return BLOG_DATE_FORMATTER.format(new Date(`${dateOnly}T00:00:00Z`));
}
