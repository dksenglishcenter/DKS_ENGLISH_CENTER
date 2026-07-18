"use client";

import { useEffect, useRef, useState } from "react";
import { ImagePlus, Link2, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatError } from "@/lib/errors/format-error";
import { uploadMediaAsset, deleteMediaAsset } from "@/lib/media/api";
import type { BlogSection } from "@/lib/blog/types";
import { isValidBlogLinkHref } from "@/lib/blog/types";

export type SectionMediaControls = {
  /** Drop orphan uploads from this editing session. */
  discard: () => Promise<void>;
  /** Keep URLs still present in body; delete the rest. */
  commit: (body: string) => Promise<void>;
};

type BlogSectionEditorProps = {
  index: number;
  section: BlogSection;
  canRemove: boolean;
  headingError?: string;
  bodyError?: string;
  onChange: (index: number, patch: Partial<BlogSection>) => void;
  onRemove: (index: number) => void;
  onRegisterControls: (index: number, controls: SectionMediaControls) => void;
  onUnregisterControls: (index: number) => void;
};

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-1 text-xs text-red-600" data-invalid="true">
      {message}
    </p>
  );
}

function insertAtCursor(
  value: string,
  start: number,
  end: number,
  insertion: string,
) {
  return {
    next: `${value.slice(0, start)}${insertion}${value.slice(end)}`,
    cursor: start + insertion.length,
  };
}

export function BlogSectionEditor({
  index,
  section,
  canRemove,
  headingError,
  bodyError,
  onChange,
  onRemove,
  onRegisterControls,
  onUnregisterControls,
}: BlogSectionEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingUrlsRef = useRef(new Set<string>());
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [linkDraft, setLinkDraft] = useState<{ label: string; href: string } | null>(
    null,
  );
  const [linkError, setLinkError] = useState<string | null>(null);

  useEffect(() => {
    onRegisterControls(index, {
      discard: async () => {
        const urls = [...pendingUrlsRef.current];
        pendingUrlsRef.current.clear();
        await Promise.all(
          urls.map(async (url) => {
            try {
              await deleteMediaAsset(url);
            } catch {
              // best-effort
            }
          }),
        );
      },
      commit: async (body: string) => {
        const keep = new Set(
          [...pendingUrlsRef.current].filter((url) => body.includes(url)),
        );
        const drop = [...pendingUrlsRef.current].filter((url) => !keep.has(url));
        pendingUrlsRef.current = keep;
        await Promise.all(
          drop.map(async (url) => {
            try {
              await deleteMediaAsset(url);
            } catch {
              // best-effort
            }
          }),
        );
      },
    });
    return () => onUnregisterControls(index);
  }, [index, onRegisterControls, onUnregisterControls]);

  const applyBodyInsert = (insertion: string) => {
    const el = textareaRef.current;
    const start = el?.selectionStart ?? section.body.length;
    const end = el?.selectionEnd ?? start;
    const { next, cursor } = insertAtCursor(section.body, start, end, insertion);
    onChange(index, { body: next });
    requestAnimationFrame(() => {
      const node = textareaRef.current;
      if (!node) return;
      node.focus();
      node.setSelectionRange(cursor, cursor);
    });
  };

  const handleInsertImage = async (file: File | null) => {
    setUploadError(null);
    if (!file) return;
    setUploading(true);
    try {
      const uploaded = await uploadMediaAsset(file, { category: "blog-section" });
      pendingUrlsRef.current.add(uploaded.url);
      // Alt chỉ cho accessibility — không dùng tên file (thường là hash vô nghĩa).
      const snippet = `\n\n![Ảnh minh họa](${uploaded.url})\n\n`;
      applyBodyInsert(snippet);
    } catch (error) {
      setUploadError(formatError(error) || "Upload ảnh thất bại");
    } finally {
      setUploading(false);
    }
  };

  const confirmInsertLink = () => {
    if (!linkDraft) return;
    const label = linkDraft.label.trim() || linkDraft.href.trim();
    const href = linkDraft.href.trim();
    if (!href || !isValidBlogLinkHref(href)) {
      setLinkError("URL phải là /đường-dẫn hoặc https://...");
      return;
    }
    const selected =
      textareaRef.current &&
      textareaRef.current.selectionStart !== textareaRef.current.selectionEnd
        ? section.body.slice(
            textareaRef.current.selectionStart,
            textareaRef.current.selectionEnd,
          )
        : "";
    const text = selected || label;
    applyBodyInsert(`[${text}](${href})`);
    setLinkDraft(null);
    setLinkError(null);
  };

  return (
    <div className="space-y-3 rounded-xl border border-border bg-muted p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-foreground">Section {index + 1}</p>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={!canRemove}
          onClick={() => onRemove(index)}
        >
          <Trash2 className="size-4" aria-hidden="true" />
          Xóa
        </Button>
      </div>

      <label className="block text-sm" data-invalid={headingError ? "true" : undefined}>
        <span className="mb-1 block font-semibold text-foreground">Heading</span>
        <Input
          className={headingError ? "border-red-500" : ""}
          value={section.heading}
          onChange={(event) => onChange(index, { heading: event.target.value })}
        />
        <FieldError message={headingError} />
      </label>

      <div className="block text-sm" data-invalid={bodyError ? "true" : undefined}>
        <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
          <span className="font-semibold text-foreground">Body</span>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
            >
              <ImagePlus className="size-4" aria-hidden="true" />
              {uploading ? "Đang tải..." : "Chèn ảnh"}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => {
                setLinkError(null);
                setLinkDraft({ label: "", href: "" });
              }}
            >
              <Link2 className="size-4" aria-hidden="true" />
              Chèn link
            </Button>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0] ?? null;
            void handleInsertImage(file);
            event.target.value = "";
          }}
        />

        <textarea
          ref={textareaRef}
          className={`min-h-36 w-full rounded-lg border px-3 py-2 font-[family-name:var(--font-body)] ${
            bodyError ? "border-red-500" : "border-border"
          }`}
          value={section.body}
          onChange={(event) => onChange(index, { body: event.target.value })}
          placeholder={
            "Viết nội dung tự do.\n\nChèn ảnh giữa các đoạn bằng nút “Chèn ảnh”.\nLink: [nhãn](/courses) hoặc dán https://..."
          }
        />
        <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
          Linh hoạt trong body: đặt con trỏ nơi muốn chèn → “Chèn ảnh” / “Chèn link”.
          Ảnh = <code className="rounded bg-card px-1">![mô tả](url)</code>, link ={" "}
          <code className="rounded bg-card px-1">[nhãn](url)</code>.
        </p>
        <FieldError message={bodyError} />
        <FieldError message={uploadError ?? undefined} />
      </div>

      {linkDraft ? (
        <div className="space-y-3 rounded-lg border border-border bg-card p-3">
          <p className="text-sm font-semibold text-foreground">Chèn link vào body</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-1 block font-semibold text-foreground">Nhãn</span>
              <Input
                value={linkDraft.label}
                onChange={(event) =>
                  setLinkDraft((prev) =>
                    prev ? { ...prev, label: event.target.value } : prev,
                  )
                }
                placeholder="Xem khóa IELTS"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-semibold text-foreground">URL</span>
              <Input
                value={linkDraft.href}
                onChange={(event) =>
                  setLinkDraft((prev) =>
                    prev ? { ...prev, href: event.target.value } : prev,
                  )
                }
                placeholder="/courses hoặc https://..."
              />
            </label>
          </div>
          <FieldError message={linkError ?? undefined} />
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => {
                setLinkDraft(null);
                setLinkError(null);
              }}
            >
              Hủy
            </Button>
            <Button type="button" size="sm" onClick={confirmInsertLink}>
              Chèn vào body
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
