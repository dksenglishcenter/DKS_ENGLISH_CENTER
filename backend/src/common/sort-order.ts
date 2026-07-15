/**
 * Trong cùng transaction: nếu `nextOrder` đã bị bản ghi khác giữ,
 * đổi chỗ — bản ghi kia nhận `currentOrder`.
 */
export async function swapSortOrderIfNeeded(
  // Prisma model delegate trong tx (galleryImage, teacher, ...)
  delegate: {
    findFirst: (args: {
      where: { sortOrder: number; NOT: { id: string } };
      select: { id: true };
    }) => Promise<{ id: string } | null>;
    update: (args: {
      where: { id: string };
      data: { sortOrder: number };
    }) => Promise<unknown>;
  },
  params: {
    id: string;
    currentOrder: number;
    nextOrder: number | undefined;
  },
): Promise<void> {
  const { id, currentOrder, nextOrder } = params;
  if (nextOrder === undefined || nextOrder === currentOrder) return;

  const conflict = await delegate.findFirst({
    where: { sortOrder: nextOrder, NOT: { id } },
    select: { id: true },
  });

  if (conflict) {
    await delegate.update({
      where: { id: conflict.id },
      data: { sortOrder: currentOrder },
    });
  }
}
