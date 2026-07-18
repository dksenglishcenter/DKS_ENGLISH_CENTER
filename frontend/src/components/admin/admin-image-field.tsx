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

/** Ô URL + upload ảnh + preview — dùng chung mọi admin có ảnh. */
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
    <div className="space-y-3" data-invalid={invalid ? "true" : undefined}>
      {hint ? <p className="text-xs text-[#9B6B50]">{hint}</p> : null}

      <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
        <label className="block text-sm">
          <span className="mb-1 block font-semibold text-[#4A2306]">{label} URL</span>
          <input
            className={`w-full rounded-lg border px-3 py-2 ${
              invalid ? "border-red-500" : "border-border"
            }`}
            value={url}
            readOnly
            placeholder="URL sau khi upload"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-semibold text-[#4A2306]">Chọn ảnh</span>
          <input
            type="file"
            accept="image/*"
            disabled={uploading}
            onChange={(event) => {
              const file = event.target.files?.[0] ?? null;
              onFile(file);
              event.target.value = "";
            }}
            className="block w-full text-sm text-[#4A2306] file:mr-3 file:rounded-lg file:border-0 file:bg-secondary file:px-3 file:py-2 file:text-sm file:font-semibold file:text-primary"
          />
        </label>
      </div>

      {error ? <p className="text-xs text-red-600">{error}</p> : null}

      {url ? (
        <div className="relative h-40 w-full max-w-sm overflow-hidden rounded-xl border border-border">
          <Image
            src={url}
            alt="Preview"
            fill
            className="object-cover"
            unoptimized
            style={{ objectPosition }}
          />
        </div>
      ) : null}
    </div>
  );
}
