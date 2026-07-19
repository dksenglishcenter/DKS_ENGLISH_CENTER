"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { scrollToElement } from "@/lib/admin/scroll";
import { formatError } from "@/lib/errors/format-error";

type UseAdminResourceListOptions<T> = {
  loadItems: () => Promise<T[]>;
  /** Scroll form into view when opened / switched to edit. Default true. */
  scrollOnFormOpen?: boolean;
};

/**
 * Shared list/form chrome for entity admins: load, list error, showForm,
 * editingId, delete dialog state, formRef scroll.
 */
export function useAdminResourceList<T>({
  loadItems,
  scrollOnFormOpen = true,
}: UseAdminResourceListOptions<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<T | null>(null);
  const [deleting, setDeleting] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setListError(null);
    try {
      setItems(await loadItems());
    } catch (err) {
      setListError(formatError(err));
    } finally {
      setLoading(false);
    }
  }, [loadItems]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!scrollOnFormOpen || !showForm) return;
    scrollToElement(formRef.current);
  }, [showForm, editingId, scrollOnFormOpen]);

  /** Close form UI only — caller handles media discard / form reset. No refetch. */
  const resetFormChrome = useCallback(() => {
    setShowForm(false);
    setEditingId(null);
  }, []);

  return {
    items,
    setItems,
    loading,
    listError,
    setListError,
    showForm,
    setShowForm,
    editingId,
    setEditingId,
    deleteTarget,
    setDeleteTarget,
    deleting,
    setDeleting,
    formRef,
    load,
    resetFormChrome,
  };
}
