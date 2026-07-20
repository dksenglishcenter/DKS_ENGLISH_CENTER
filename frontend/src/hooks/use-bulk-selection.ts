"use client";

import { useCallback, useMemo, useState } from "react";

/**
 * Row selection for admin tables: per-row tick, select-all, and bulk actions.
 * Ids that disappear from `ids` (after a reload) are dropped automatically.
 */
export function useBulkSelection(ids: string[]) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Only count ids that still exist in the current list.
  const visible = useMemo(
    () => ids.filter((id) => selected.has(id)),
    [ids, selected],
  );

  const toggle = useCallback((id: string) => {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    setSelected((current) => {
      const allSelected = ids.length > 0 && ids.every((id) => current.has(id));
      return allSelected ? new Set() : new Set(ids);
    });
  }, [ids]);

  const clear = useCallback(() => setSelected(new Set()), []);

  /**
   * Run `action` for every selected row, one at a time so a failure stops
   * early and can be reported. Clears the selection when it finishes.
   */
  const runOnSelected = useCallback(
    async (action: (id: string) => Promise<unknown>) => {
      setBusy(true);
      try {
        for (const id of visible) {
          await action(id);
        }
        setSelected(new Set());
        setConfirmOpen(false);
      } finally {
        setBusy(false);
      }
    },
    [visible],
  );

  return {
    selectedIds: visible,
    count: visible.length,
    isSelected: (id: string) => selected.has(id),
    allSelected: ids.length > 0 && ids.every((id) => selected.has(id)),
    toggle,
    toggleAll,
    clear,
    busy,
    confirmOpen,
    openConfirm: () => setConfirmOpen(true),
    closeConfirm: () => setConfirmOpen(false),
    runOnSelected,
  };
}
