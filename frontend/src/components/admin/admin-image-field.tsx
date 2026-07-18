"use client";

import Image from "next/image";

type AdminImageFieldProps = {
  label?: string;
  url: string;
  uploading: boolean;
  objectPosition?: string;
  hint?: string;
  invalid?: boolean;
  error?: string;
  onFile: (file: File | null) => void;
};

/** Shared URL + upload + preview field for every admin image input. */
export function AdminImageField({
  label = "Ảnh",
  url,
  uploading,
  objectPosition = "center",
  hint,
  invalid,
  error,
  onFile,
}: AdminImageFieldProps) {
  return (
    <div className="space-y-4" data-invalid={invalid ? "true" : undefined}>
      {hint ? (
        <p className="rounded-lg bg-muted px-3 py-2 text-xs leading-relaxed text-muted-foreground">
          {hint}
        </p>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 md:items-start">
        <label className="block text-sm">
          <span className="mb-1.5 block font-semibold text-foreground">
            {label} URL
          </span>
          <input
            className={`w-full truncate rounded-lg border bg-muted px-3 py-2.5 text-muted-foreground ${
              invalid ? "border-red-500" : "border-border"
            }`}
            value={url}
            readOnly
            placeholder="Tự điền sau khi tải ảnh lên"
          />
        </label>

        <label className="block text-sm">
          <span className="mb-1.5 block font-semibold text-foreground">
            Chọn ảnh
          </span>
          <input
            type="file"
            accept="image/*"
            disabled={uploading}
            onChange={(event) => {
              const file = event.target.files?.[0] ?? null;
              onFile(file);
              event.target.value = "";
            }}
            className="block w-full cursor-pointer text-sm text-muted-foreground file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-secondary file:px-4 file:py-2 file:font-semibold file:text-primary hover:file:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
          />
          {uploading ? (
            <span className="mt-1.5 block text-xs font-medium text-primary">
              Đang tải ảnh lên…
            </span>
          ) : null}
        </label>
      </div>

      {error ? (
        <p className="text-xs font-medium text-red-600">{error}</p>
      ) : null}

      <div>
        <span className="mb-1.5 block text-sm font-semibold text-foreground">
          Xem trước
        </span>
        {url ? (
          <div className="relative h-44 w-full max-w-sm overflow-hidden rounded-xl border border-border bg-muted">
            <Image
              src={url}
              alt="Preview"
              fill
              className="object-cover"
              unoptimized
              style={{ objectPosition }}
            />
          </div>
        ) : (
          <div className="flex h-44 w-full max-w-sm items-center justify-center rounded-xl border border-dashed border-border bg-muted text-sm text-muted-foreground">
            Chưa có ảnh
          </div>
        )}
      </div>
    </div>
  );
}
