"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

type PaymentProofViewerProps = {
  url: string;
  label?: string;
  className?: string;
};

/** Preview minh chứng CK ngay trên trang + phóng to overlay (không mở tab ngoài). */
export function PaymentProofViewer({
  url,
  label = "Minh chứng chuyển khoản",
  className = "",
}: PaymentProofViewerProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className={`mt-2 space-y-1.5 ${className}`}>
      <p className="text-sm font-semibold text-foreground">{label}</p>
      <button
        type="button"
        className="block w-full max-w-sm overflow-hidden rounded-xl border border-border bg-muted text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        onClick={() => setOpen(true)}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt={label}
          className="max-h-56 w-full object-contain"
        />
        <span className="block px-3 py-1.5 text-xs font-semibold text-primary">
          Bấm để phóng to
        </span>
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={label}
          onClick={() => setOpen(false)}
        >
          <button
            type="button"
            className="absolute right-4 top-4 rounded-full bg-white/90 p-2 text-foreground shadow"
            aria-label="Đóng"
            onClick={() => setOpen(false)}
          >
            <X className="size-5" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt={label}
            className="max-h-[90vh] max-w-[min(960px,92vw)] rounded-lg object-contain shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      ) : null}
    </div>
  );
}
