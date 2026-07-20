"use client";

import { Eye, EyeOff, Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/button";

/** Bigger hit area + pointer cursor so rows are easy to tick. */
const CHECKBOX_CLASS =
  "size-[18px] cursor-pointer accent-primary transition-transform hover:scale-110";

/** Shown above an admin table once at least one row is ticked. */
export function BulkActionsBar({
  count,
  busy,
  onDelete,
  onClear,
  onShow,
  onHide,
}: {
  count: number;
  busy: boolean;
  onDelete: () => void;
  onClear: () => void;
  /** Optional — only for tables that have a Published column. */
  onShow?: () => void;
  onHide?: () => void;
}) {
  if (count === 0) return null;

  return (
    <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/30 bg-secondary px-4 py-3">
      <span className="text-sm font-semibold text-foreground">
        Đã chọn {count} mục
      </span>
      <div className="flex flex-wrap items-center gap-2">
        {onShow ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="rounded-lg"
            disabled={busy}
            onClick={onShow}
          >
            <Eye className="size-4" aria-hidden="true" />
            Hiện
          </Button>
        ) : null}
        {onHide ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="rounded-lg"
            disabled={busy}
            onClick={onHide}
          >
            <EyeOff className="size-4" aria-hidden="true" />
            Ẩn
          </Button>
        ) : null}
        <Button
          type="button"
          size="sm"
          variant="destructive"
          className="rounded-lg"
          disabled={busy}
          onClick={onDelete}
        >
          <Trash2 className="size-4" aria-hidden="true" />
          {busy ? "Đang xử lý…" : "Xóa đã chọn"}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="rounded-lg"
          disabled={busy}
          onClick={onClear}
        >
          <X className="size-4" aria-hidden="true" />
          Bỏ chọn
        </Button>
      </div>
    </div>
  );
}

/** Header checkbox that selects/clears every row in the table. */
export function SelectAllHeaderCell({
  allSelected,
  onToggle,
}: {
  allSelected: boolean;
  onToggle: () => void;
}) {
  return (
    <th className="w-12 px-4 py-3">
      <input
        type="checkbox"
        className={CHECKBOX_CLASS}
        aria-label="Chọn tất cả"
        checked={allSelected}
        onChange={onToggle}
      />
    </th>
  );
}

/** Per-row checkbox cell. The whole cell is clickable, not just the box. */
export function SelectRowCell({
  checked,
  onToggle,
  label,
  disabled = false,
  disabledTitle,
}: {
  checked: boolean;
  onToggle: () => void;
  label: string;
  /** e.g. the signed-in user cannot delete their own account. */
  disabled?: boolean;
  disabledTitle?: string;
}) {
  return (
    <td className="w-12 px-4 py-3">
      <label
        className={`flex items-center ${
          disabled ? "cursor-not-allowed" : "cursor-pointer"
        }`}
        title={disabled ? disabledTitle : undefined}
      >
        <input
          type="checkbox"
          className={`${CHECKBOX_CLASS} disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100`}
          aria-label={`Chọn ${label}`}
          checked={checked}
          disabled={disabled}
          onChange={onToggle}
        />
      </label>
    </td>
  );
}
