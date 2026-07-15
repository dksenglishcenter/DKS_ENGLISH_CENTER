"use client";

import { Button } from "@/components/ui/button";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Xóa",
  cancelLabel = "Huỷ",
  busy = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Đóng hộp thoại"
        className="absolute inset-0 bg-[#4A2306]/45"
        disabled={busy}
        onClick={onCancel}
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-desc"
        className="relative z-10 w-full max-w-md rounded-2xl border border-border bg-white p-6 shadow-xl"
      >
        <h3
          id="confirm-dialog-title"
          className="text-lg font-black text-[#4A2306] font-[family-name:var(--font-nunito)]"
        >
          {title}
        </h3>
        <p id="confirm-dialog-desc" className="mt-2 text-sm leading-relaxed text-[#6B3E26]">
          {description}
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="outline" disabled={busy} onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button type="button" disabled={busy} onClick={onConfirm}>
            {busy ? "Đang xóa..." : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
