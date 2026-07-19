"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CalendarDays, Plus } from "lucide-react";

import { AdminImageField } from "@/components/admin/admin-image-field";
import { BlogSectionEditor } from "@/components/admin/blog-section-editor";
import type { SectionMediaControls } from "@/components/admin/blog-section-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCloudinaryImageReplace } from "@/hooks/use-cloudinary-image-replace";
import { scrollToFirstInvalid } from "@/lib/admin/scroll";
import { slugify } from "@/lib/admin/slugify";
import { createBlogPost, updateBlogPost } from "@/lib/blog/api";
import type { BlogPost, BlogPostPayload, BlogSection } from "@/lib/blog/types";
import { formatError } from "@/lib/errors/format-error";
import { isHttpUrl } from "@/lib/media/is-http-url";

type EditableSection = BlogSection & { clientKey: string };

type FieldKey =
  | keyof BlogPostPayload
  | "form"
  | `sections.${number}.heading`
  | `sections.${number}.body`;

type FieldErrors = Partial<Record<FieldKey, string>>;

const createEmptySection = (): EditableSection => ({
  clientKey: crypto.randomUUID(),
  heading: "",
  body: "",
});

const CATEGORY_OPTIONS = [
  "IELTS Tips",
  "Học Tiếng Anh",
  "Công Nghệ",
  "Thi Cử",
  "Ngữ Pháp",
  "Phụ Huynh",
] as const;

type BlogFormState = Omit<BlogPostPayload, "sections"> & {
  sections: EditableSection[];
};

function toEditableSections(sections: BlogSection[]): EditableSection[] {
  if (!sections.length) return [createEmptySection()];
  return sections.map((section) => ({
    clientKey: crypto.randomUUID(),
    heading: section.heading,
    body: section.body,
    // Keep legacy fields in form state so save doesn't wipe old data accidentally
    // until editor migrates content into body markdown.
    imageUrl: section.imageUrl ?? null,
    imageAlt: section.imageAlt ?? "",
    linkLabel: section.linkLabel ?? "",
    linkHref: section.linkHref ?? "",
  }));
}

function serializeSections(sections: EditableSection[]): BlogSection[] {
  return sections.map((section) => {
    const next: BlogSection = {
      heading: section.heading.trim(),
      body: section.body.trim(),
    };
    // Preserve legacy optional fields if still present (old posts).
    const imageUrl = section.imageUrl?.trim();
    if (imageUrl) {
      next.imageUrl = imageUrl;
      const alt = section.imageAlt?.trim();
      if (alt) next.imageAlt = alt;
    }
    const linkHref = section.linkHref?.trim();
    if (linkHref) {
      next.linkHref = linkHref;
      next.linkLabel = section.linkLabel?.trim() || linkHref;
    }
    return next;
  });
}

function createInitialValues(
  post: BlogPost | null,
  nextSortOrder: number,
): BlogFormState {
  if (post) {
    return {
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      category: post.category,
      publishedAt: post.publishedAt,
      readTimeMinutes: post.readTimeMinutes,
      coverImageUrl: post.coverImageUrl,
      featured: post.featured,
      intro: post.intro,
      sections: toEditableSections(post.sections),
      takeaway: post.takeaway,
      sortOrder: post.sortOrder,
      isPublished: post.isPublished,
    };
  }

  return {
    slug: "",
    title: "",
    excerpt: "",
    category: CATEGORY_OPTIONS[0],
    publishedAt: new Date().toISOString().slice(0, 10),
    readTimeMinutes: 5,
    coverImageUrl: "",
    featured: false,
    intro: "",
    sections: [createEmptySection()],
    takeaway: "",
    sortOrder: nextSortOrder,
    isPublished: true,
  };
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-1 text-xs text-red-600" data-invalid="true">
      {message}
    </p>
  );
}

type BlogFormProps = {
  post: BlogPost | null;
  nextSortOrder: number;
  onCancel: () => void;
  onSaved: (message: string) => void;
};

export function BlogForm({
  post,
  nextSortOrder,
  onCancel,
  onSaved,
}: BlogFormProps) {
  const editingId = post?.id ?? null;
  const [form, setForm] = useState<BlogFormState>(() =>
    createInitialValues(post, nextSortOrder),
  );
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);
  const cover = useCloudinaryImageReplace({ category: "blog-cover" });
  const sectionMediaControlsRef = useRef(new Map<number, SectionMediaControls>());

  useEffect(() => {
    cover.reset(post?.coverImageUrl ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- remount via key on open
  }, []);

  const registerSectionControls = useCallback(
    (index: number, controls: SectionMediaControls) => {
      sectionMediaControlsRef.current.set(index, controls);
    },
    [],
  );

  const unregisterSectionControls = useCallback((index: number) => {
    sectionMediaControlsRef.current.delete(index);
  }, []);

  const discardAllSectionMedia = async () => {
    const controls = [...sectionMediaControlsRef.current.values()];
    await Promise.all(controls.map((control) => control.discard()));
    sectionMediaControlsRef.current.clear();
  };

  // Khi admin đóng form bằng unmount (toggle / xóa), discard media section còn treo.
  useEffect(() => {
    return () => {
      void discardAllSectionMedia();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- unmount orphan cleanup
  }, []);

  const clearFieldError = (key: FieldKey) => {
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const handleUpload = async (file: File | null) => {
    clearFieldError("coverImageUrl");
    try {
      const url = await cover.upload(file);
      if (url) setForm((prev) => ({ ...prev, coverImageUrl: url }));
    } catch (error) {
      setFieldErrors((prev) => ({
        ...prev,
        coverImageUrl: formatError(error) || "Upload ảnh thất bại",
      }));
      scrollToFirstInvalid(formRef.current);
    }
  };

  const validate = (): FieldErrors => {
    const errors: FieldErrors = {};
    if (form.title.trim().length < 2) errors.title = "Tiêu đề cần tối thiểu 2 ký tự";
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.slug.trim())) {
      errors.slug = "Slug chỉ gồm chữ thường, số và dấu gạch ngang";
    }
    if (form.excerpt.trim().length < 10) errors.excerpt = "Tóm tắt cần tối thiểu 10 ký tự";
    if (!(CATEGORY_OPTIONS as readonly string[]).includes(form.category.trim())) {
      errors.category = "Vui lòng chọn chuyên mục";
    }
    if (!form.publishedAt) errors.publishedAt = "Ngày đăng là bắt buộc";
    if (!Number.isInteger(form.readTimeMinutes) || form.readTimeMinutes < 1) {
      errors.readTimeMinutes = "Thời gian đọc phải >= 1";
    }
    if (!isHttpUrl(form.coverImageUrl)) {
      errors.coverImageUrl = "Chưa có ảnh — vui lòng chọn ảnh rồi lưu";
    }
    if (form.intro.trim().length < 10) errors.intro = "Intro cần tối thiểu 10 ký tự";
    if (form.takeaway.trim().length < 10) errors.takeaway = "Takeaway cần tối thiểu 10 ký tự";
    if (!form.sections.length) errors.sections = "Cần ít nhất 1 section";

    form.sections.forEach((section, index) => {
      if (section.heading.trim().length < 2) {
        errors[`sections.${index}.heading`] = "Heading cần tối thiểu 2 ký tự";
      }
      if (section.body.trim().length < 10) {
        errors[`sections.${index}.body`] = "Nội dung section cần tối thiểu 10 ký tự";
      }
    });

    return errors;
  };

  const handleCancel = async () => {
    await cover.discard();
    await discardAllSectionMedia();
    cover.reset(null);
    onCancel();
  };

  const handleSave = async () => {
    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length) {
      setFieldErrors((prev) => ({
        ...prev,
        form: "Vui lòng sửa các ô còn lỗi trước khi lưu.",
      }));
      scrollToFirstInvalid(formRef.current);
      return;
    }

    setSaving(true);
    try {
      const sections = serializeSections(form.sections);
      const payload: BlogPostPayload = {
        ...form,
        slug: form.slug.trim(),
        title: form.title.trim(),
        excerpt: form.excerpt.trim(),
        category: form.category.trim(),
        coverImageUrl: form.coverImageUrl.trim(),
        intro: form.intro.trim(),
        takeaway: form.takeaway.trim(),
        sections,
      };

      const response = editingId
        ? await updateBlogPost(editingId, payload)
        : await createBlogPost(payload);

      await cover.commit(payload.coverImageUrl);
      await Promise.all(
        sections.map((section, index) =>
          sectionMediaControlsRef.current.get(index)?.commit(section.body),
        ),
      );
      sectionMediaControlsRef.current.clear();
      cover.reset(null);
      onSaved(response.message);
    } catch (error) {
      setFieldErrors({ form: formatError(error) });
      scrollToFirstInvalid(formRef.current);
    } finally {
      setSaving(false);
    }
  };

  const patchSection = (index: number, patch: Partial<BlogSection>) => {
    setForm((prev) => ({
      ...prev,
      sections: prev.sections.map((section, sectionIndex) =>
        sectionIndex === index ? { ...section, ...patch } : section,
      ),
    }));
    if ("heading" in patch) clearFieldError(`sections.${index}.heading`);
    if ("body" in patch) clearFieldError(`sections.${index}.body`);
  };

  const removeSection = async (index: number) => {
    const controls = sectionMediaControlsRef.current.get(index);
    if (controls) await controls.discard();
    setForm((prev) => ({
      ...prev,
      sections: prev.sections.filter((_, sectionIndex) => sectionIndex !== index),
    }));
  };

  return (
    <div
      ref={formRef}
      className="scroll-mt-6 space-y-4 rounded-2xl border border-border bg-card p-5"
    >
      <h3 className="text-lg font-black text-foreground font-[family-name:var(--font-nunito)]">
        {editingId ? "Sửa bài viết" : "Thêm bài viết"}
      </h3>
      {fieldErrors.form ? (
        <p className="text-sm text-red-600" data-invalid="true">
          {fieldErrors.form}
        </p>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm" data-invalid={fieldErrors.title ? "true" : undefined}>
          <span className="mb-1 block font-semibold text-foreground">Tiêu đề</span>
          <Input
            className={fieldErrors.title ? "border-red-500" : ""}
            value={form.title}
            onChange={(event) => {
              const title = event.target.value;
              setForm((prev) => ({
                ...prev,
                title,
                slug: editingId ? prev.slug : slugify(title),
              }));
              clearFieldError("title");
            }}
          />
          <FieldError message={fieldErrors.title} />
        </label>

        <label className="block text-sm" data-invalid={fieldErrors.slug ? "true" : undefined}>
          <span className="mb-1 block font-semibold text-foreground">Slug</span>
          <Input
            className={fieldErrors.slug ? "border-red-500" : ""}
            value={form.slug}
            onChange={(event) => {
              setForm((prev) => ({ ...prev, slug: event.target.value }));
              clearFieldError("slug");
            }}
          />
          <FieldError message={fieldErrors.slug} />
        </label>

        <label className="block text-sm md:col-span-2" data-invalid={fieldErrors.excerpt ? "true" : undefined}>
          <span className="mb-1 block font-semibold text-foreground">Tóm tắt</span>
          <textarea
            className={`min-h-24 w-full rounded-lg border px-3 py-2 ${
              fieldErrors.excerpt ? "border-red-500" : "border-border"
            }`}
            value={form.excerpt}
            onChange={(event) => {
              setForm((prev) => ({ ...prev, excerpt: event.target.value }));
              clearFieldError("excerpt");
            }}
          />
          <FieldError message={fieldErrors.excerpt} />
        </label>

        <label className="block text-sm" data-invalid={fieldErrors.category ? "true" : undefined}>
          <span className="mb-1 block font-semibold text-foreground">Chuyên mục</span>
          <select
            className={`w-full rounded-lg border bg-card px-3 py-2 ${
              fieldErrors.category ? "border-red-500" : "border-border"
            }`}
            value={form.category}
            onChange={(event) => {
              setForm((prev) => ({ ...prev, category: event.target.value }));
              clearFieldError("category");
            }}
          >
            {!(CATEGORY_OPTIONS as readonly string[]).includes(form.category) &&
            form.category ? (
              <option value={form.category}>{form.category}</option>
            ) : null}
            {CATEGORY_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <FieldError message={fieldErrors.category} />
        </label>

        <label className="block text-sm" data-invalid={fieldErrors.publishedAt ? "true" : undefined}>
          <span className="mb-1 block font-semibold text-foreground">Ngày đăng</span>
          <div className="relative">
            <Input
              type="date"
              className={`cursor-pointer pr-10 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0 ${
                fieldErrors.publishedAt ? "border-red-500" : ""
              }`}
              value={form.publishedAt}
              onChange={(event) => {
                setForm((prev) => ({ ...prev, publishedAt: event.target.value }));
                clearFieldError("publishedAt");
              }}
            />
            <CalendarDays
              aria-hidden="true"
              className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            />
          </div>
          <FieldError message={fieldErrors.publishedAt} />
        </label>

        <label className="block text-sm" data-invalid={fieldErrors.readTimeMinutes ? "true" : undefined}>
          <span className="mb-1 block font-semibold text-foreground">Phút đọc</span>
          <Input
            type="number"
            min={1}
            className={fieldErrors.readTimeMinutes ? "border-red-500" : ""}
            value={form.readTimeMinutes}
            onChange={(event) => {
              setForm((prev) => ({
                ...prev,
                readTimeMinutes: Number(event.target.value) || 0,
              }));
              clearFieldError("readTimeMinutes");
            }}
          />
          <FieldError message={fieldErrors.readTimeMinutes} />
        </label>

        <label className="block text-sm">
          <span className="mb-1 block font-semibold text-foreground">Thứ tự</span>
          <Input
            type="number"
            min={0}
            value={form.sortOrder ?? 0}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                sortOrder: Number(event.target.value) || 0,
              }))
            }
          />
        </label>

        <div className="flex flex-wrap gap-4 md:col-span-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <input
              type="checkbox"
              checked={Boolean(form.featured)}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, featured: event.target.checked }))
              }
            />
            Featured
          </label>
          <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <input
              type="checkbox"
              checked={Boolean(form.isPublished)}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  isPublished: event.target.checked,
                }))
              }
            />
            Published
          </label>
        </div>

        <div
          className="md:col-span-2"
          data-invalid={fieldErrors.coverImageUrl ? "true" : undefined}
        >
          <AdminImageField
            label="Ảnh cover"
            hint=""
            url={form.coverImageUrl}
            uploading={cover.uploading}
            invalid={Boolean(fieldErrors.coverImageUrl)}
            error={fieldErrors.coverImageUrl}
            onFile={(file) => void handleUpload(file)}
          />
        </div>

        <label className="block text-sm md:col-span-2" data-invalid={fieldErrors.intro ? "true" : undefined}>
          <span className="mb-1 block font-semibold text-foreground">Intro</span>
          <textarea
            className={`min-h-28 w-full rounded-lg border px-3 py-2 ${
              fieldErrors.intro ? "border-red-500" : "border-border"
            }`}
            value={form.intro}
            onChange={(event) => {
              setForm((prev) => ({ ...prev, intro: event.target.value }));
              clearFieldError("intro");
            }}
          />
          <FieldError message={fieldErrors.intro} />
        </label>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h4 className="font-bold text-foreground">Sections</h4>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() =>
              setForm((prev) => ({
                ...prev,
                sections: [...prev.sections, createEmptySection()],
              }))
            }
          >
            <Plus className="size-4" aria-hidden="true" />
            Thêm section
          </Button>
        </div>
        <FieldError message={fieldErrors.sections} />

        {form.sections.map((section, index) => (
          <BlogSectionEditor
            key={section.clientKey}
            index={index}
            section={section}
            canRemove={form.sections.length > 1}
            headingError={fieldErrors[`sections.${index}.heading`]}
            bodyError={fieldErrors[`sections.${index}.body`]}
            onChange={patchSection}
            onRemove={(sectionIndex) => void removeSection(sectionIndex)}
            onRegisterControls={registerSectionControls}
            onUnregisterControls={unregisterSectionControls}
          />
        ))}
      </div>

      <label className="block text-sm" data-invalid={fieldErrors.takeaway ? "true" : undefined}>
        <span className="mb-1 block font-semibold text-foreground">Takeaway</span>
        <textarea
          className={`min-h-24 w-full rounded-lg border px-3 py-2 ${
            fieldErrors.takeaway ? "border-red-500" : "border-border"
          }`}
          value={form.takeaway}
          onChange={(event) => {
            setForm((prev) => ({ ...prev, takeaway: event.target.value }));
            clearFieldError("takeaway");
          }}
        />
        <FieldError message={fieldErrors.takeaway} />
      </label>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={saving}
          onClick={() => void handleCancel()}
        >
          Hủy
        </Button>
        <Button type="button" disabled={saving} onClick={() => void handleSave()}>
          {saving ? "Đang lưu..." : "Lưu bài viết"}
        </Button>
      </div>
    </div>
  );
}
