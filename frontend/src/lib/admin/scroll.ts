/** Cuộn mượt tới form admin khi mở Thêm/Sửa. */
export function scrollToElement(
  el: HTMLElement | null | undefined,
  options?: ScrollIntoViewOptions,
) {
  if (!el) return;
  window.setTimeout(() => {
    el.scrollIntoView({
      behavior: "smooth",
      block: "start",
      ...options,
    });
  }, 50);
}

/**
 * Cuộn tới ô lỗi đầu tiên trong form (theo thứ tự DOM).
 * Ưu tiên: [data-invalid="true"] → .border-red-500 → thông báo lỗi.
 */
export function scrollToFirstInvalid(
  root: HTMLElement | null | undefined,
) {
  if (!root) return;
  const target =
    root.querySelector<HTMLElement>('[data-invalid="true"]') ??
    root.querySelector<HTMLElement>(".border-red-500") ??
    root.querySelector<HTMLElement>(".text-red-600");
  if (!target) {
    scrollToElement(root);
    return;
  }
  scrollToElement(target, { block: "center" });
  const focusable = target.matches("input, select, textarea, button")
    ? target
    : target.querySelector<HTMLElement>("input, select, textarea");
  focusable?.focus?.({ preventScroll: true });
}
