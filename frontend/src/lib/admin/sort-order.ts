/** Thứ tự tiếp theo = max(sortOrder) + 1, hoặc 0 nếu list rỗng. */
export function nextSortOrder(items: { sortOrder: number }[]): number {
  if (items.length === 0) return 0;
  return Math.max(...items.map((item) => item.sortOrder)) + 1;
}
