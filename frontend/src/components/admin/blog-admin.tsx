"use client";

import { useEffect, useRef, useState } from "react";
import { CalendarDays, Plus, Trash2 } from "lucide-react";

import { AdminImageField } from "@/components/admin/admin-image-field";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCloudinaryImageReplace } from "@/hooks/use-cloudinary-image-replace";
import { formatAdminDate } from "@/lib/admin/format";
import { scrollToElement, scrollToFirstInvalid } from "@/lib/admin/scroll";
import { slugify } from "@/lib/admin/slugify";
import {
  createBlogPost,
  deleteBlogPost,
  listBlogPosts,
  updateBlogPost,
} from "@/lib/blog/api";
import type {
  BlogPost,
  BlogPostPayload,
  BlogSection,
} from "@/lib/blog/types";
import { formatError } from "@/lib/errors/format-error";
import { isHttpUrl } from "@/lib/media/is-http-url";

type FieldKey =
  | keyof BlogPostPayload
  | "form"
  | `sections.${number}.heading`
  | `sections.${number}.body`;

type FieldErrors = Partial<Record<FieldKey, string>>;

const EMPTY_SECTION: BlogSection = { heading: "", body: "" };

const CATEGORY_OPTIONS = [
  "IELTS Tips",
  "Học Tiếng Anh",
  "Công Nghệ",
  "Thi Cử",
  "Ngữ Pháp",
  "Phụ Huynh",
] as const;

const EMPTY_FORM: BlogPostPayload = {
  slug: "",
  title: "",
  excerpt: "",
  category: CATEGORY_OPTIONS[0],
  publishedAt: new Date().toISOString().slice(0, 10),
  readTimeMinutes: 5,
  coverImageUrl: "",
  featured: false,
  intro: "",
  sections: [{ ...EMPTY_SECTION }],
  takeaway: "",
  sortOrder: 0,
  isPublished: true,
};

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-1 text-xs text-red-600" data-invalid="true">
      {message}
    </p>
  );
}

export function BlogAdmin() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<BlogPostPayload>(EMPTY_FORM);
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<BlogPost | null>(null);
  /** Tăng mỗi lần bấm Thêm/Sửa để luôn cuộn tới form, kể cả bấm lại cùng bài. */
  const [scrollTick, setScrollTick] = useState(0);
  const formRef = useRef<HTMLDivElement>(null);
  const cover = useCloudinaryImageReplace({ category: "blog-cover" });

  const load = async () => {
    setLoading(true);
    setListError(null);
    try {
      const response = await listBlogPosts({ publishedOnly: false });
      setPosts(response.blogPosts);
    } catch (error) {
      setListError(formatError(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  useEffect(() => {
    if (showForm) scrollToElement(formRef.current);
  }, [showForm, scrollTick]);

  const clearFieldError = (key: FieldKey) => {
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const openCreate = async () => {
    await cover.discard();
    setEditingId(null);
    setFieldErrors({});
    cover.reset(null);
    const nextOrder =
      posts.reduce((max, post) => Math.max(max, post.sortOrder), -1) + 1;
    setForm({ ...EMPTY_FORM, sortOrder: nextOrder });
    setShowForm(true);
    setScrollTick((tick) => tick + 1);
  };

  const openEdit = async (post: BlogPost) => {
    await cover.discard();
    setEditingId(post.id);
    setFieldErrors({});
    cover.reset(post.coverImageUrl);
    setForm({
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      category: post.category,
      publishedAt: post.publishedAt,
      readTimeMinutes: post.readTimeMinutes,
      coverImageUrl: post.coverImageUrl,
      featured: post.featured,
      intro: post.intro,
      sections: post.sections.length
        ? post.sections.map((section) => ({ ...section }))
        : [{ ...EMPTY_SECTION }],
      takeaway: post.takeaway,
      sortOrder: post.sortOrder,
      isPublished: post.isPublished,
    });
    setShowForm(true);
    setScrollTick((tick) => tick + 1);
  };

  const closeForm = async () => {
    await cover.discard();
    setShowForm(false);
    setEditingId(null);
    setFieldErrors({});
    cover.reset(null);
    setForm(EMPTY_FORM);
  };

  const toggleCreateForm = async () => {
    if (showForm && !editingId) {
      await closeForm();
      return;
    }
    await openCreate();
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
      const payload: BlogPostPayload = {
        ...form,
        slug: form.slug.trim(),
        title: form.title.trim(),
        excerpt: form.excerpt.trim(),
        category: form.category.trim(),
        coverImageUrl: form.coverImageUrl.trim(),
        intro: form.intro.trim(),
        takeaway: form.takeaway.trim(),
        sections: form.sections.map((section) => ({
          heading: section.heading.trim(),
          body: section.body.trim(),
        })),
      };

      if (editingId) await updateBlogPost(editingId, payload);
      else await createBlogPost(payload);

      await cover.commit(payload.coverImageUrl);
      setShowForm(false);
      setEditingId(null);
      setForm(EMPTY_FORM);
      await load();
    } catch (error) {
      setFieldErrors({ form: formatError(error) });
      scrollToFirstInvalid(formRef.current);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setListError(null);
    try {
      await deleteBlogPost(deleteTarget.id);
      if (editingId === deleteTarget.id) await closeForm();
      setDeleteTarget(null);
      await load();
    } catch (error) {
      setListError(formatError(error));
    } finally {
      setDeleting(false);
    }
  };

  const updateSection = (
    index: number,
    key: keyof BlogSection,
    value: string,
  ) => {
    setForm((prev) => ({
      ...prev,
      sections: prev.sections.map((section, sectionIndex) =>
        sectionIndex === index ? { ...section, [key]: value } : section,
      ),
    }));
    clearFieldError(`sections.${index}.${key}`);
  };

  return (
    <section className="space-y-6" aria-labelledby="blog-admin-title">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2
            id="blog-admin-title"
            className="text-2xl font-black text-[#4A2306] font-[family-name:var(--font-nunito)]"
          >
            Blog
          </h2>
          <p className="mt-1 text-sm text-[#9B6B50]">
            Quản lý bài viết blog: intro, sections và ảnh cover.
          </p>
        </div>
        <Button
          type="button"
          variant={showForm && !editingId ? "outline" : "primary"}
          onClick={() => void toggleCreateForm()}
        >
          <Plus className="size-4" aria-hidden="true" />
          {showForm && !editingId ? "Đóng form thêm" : "Thêm bài viết"}
        </Button>
      </div>

      {listError ? <p className="text-sm text-red-600">{listError}</p> : null}
      {loading ? <p className="text-sm text-[#9B6B50]">Đang tải...</p> : null}

      <div className="overflow-x-auto rounded-2xl border border-border bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-border bg-[#FFF9F5] text-[#9B6B50]">
            <tr>
              <th className="px-4 py-3 font-semibold">Bài viết</th>
              <th className="px-4 py-3 font-semibold">Chuyên mục</th>
              <th className="px-4 py-3 font-semibold">Ngày</th>
              <th className="px-4 py-3 font-semibold">Published</th>
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3">
                  <div className="font-semibold text-[#4A2306]">{post.title}</div>
                  <div className="text-xs text-[#9B6B50]">/{post.slug}</div>
                </td>
                <td className="px-4 py-3">{post.category}</td>
                <td className="px-4 py-3">
                  {formatAdminDate(`${post.publishedAt}T00:00:00Z`)}
                </td>
                <td className="px-4 py-3">
                  {post.isPublished ? "Có" : "Ẩn"}
                  {post.featured ? " · Hot" : ""}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => void openEdit(post)}
                    >
                      Sửa
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setDeleteTarget(post)}
                    >
                      Xóa
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && posts.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">
            Chưa có bài viết.
          </p>
        ) : null}
      </div>

      {showForm ? (
        <div
          ref={formRef}
          className="scroll-mt-6 space-y-4 rounded-2xl border border-border bg-white p-5"
        >
          <h3 className="text-lg font-black text-[#4A2306] font-[family-name:var(--font-nunito)]">
            {editingId ? "Sửa bài viết" : "Thêm bài viết"}
          </h3>
          {fieldErrors.form ? (
            <p className="text-sm text-red-600" data-invalid="true">
              {fieldErrors.form}
            </p>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm" data-invalid={fieldErrors.title ? "true" : undefined}>
              <span className="mb-1 block font-semibold text-[#4A2306]">Tiêu đề</span>
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
              <span className="mb-1 block font-semibold text-[#4A2306]">Slug</span>
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
              <span className="mb-1 block font-semibold text-[#4A2306]">Tóm tắt</span>
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
              <span className="mb-1 block font-semibold text-[#4A2306]">Chuyên mục</span>
              <select
                className={`w-full rounded-lg border bg-white px-3 py-2 ${
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
              <span className="mb-1 block font-semibold text-[#4A2306]">Ngày đăng</span>
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
                  className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-[#9B6B50]"
                />
              </div>
              <FieldError message={fieldErrors.publishedAt} />
            </label>

            <label className="block text-sm" data-invalid={fieldErrors.readTimeMinutes ? "true" : undefined}>
              <span className="mb-1 block font-semibold text-[#4A2306]">Phút đọc</span>
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
              <span className="mb-1 block font-semibold text-[#4A2306]">Thứ tự</span>
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
              <label className="flex items-center gap-2 text-sm font-semibold text-[#4A2306]">
                <input
                  type="checkbox"
                  checked={Boolean(form.featured)}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, featured: event.target.checked }))
                  }
                />
                Featured
              </label>
              <label className="flex items-center gap-2 text-sm font-semibold text-[#4A2306]">
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
              <span className="mb-1 block font-semibold text-[#4A2306]">Intro</span>
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
              <h4 className="font-bold text-[#4A2306]">Sections</h4>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() =>
                  setForm((prev) => ({
                    ...prev,
                    sections: [...prev.sections, { ...EMPTY_SECTION }],
                  }))
                }
              >
                <Plus className="size-4" aria-hidden="true" />
                Thêm section
              </Button>
            </div>
            <FieldError message={fieldErrors.sections} />

            {form.sections.map((section, index) => (
              <div
                key={index}
                className="space-y-3 rounded-xl border border-border bg-[#FFF9F5] p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-[#4A2306]">
                    Section {index + 1}
                  </p>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={form.sections.length <= 1}
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        sections: prev.sections.filter(
                          (_, sectionIndex) => sectionIndex !== index,
                        ),
                      }))
                    }
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                    Xóa
                  </Button>
                </div>
                <label
                  className="block text-sm"
                  data-invalid={
                    fieldErrors[`sections.${index}.heading`] ? "true" : undefined
                  }
                >
                  <span className="mb-1 block font-semibold text-[#4A2306]">
                    Heading
                  </span>
                  <Input
                    className={
                      fieldErrors[`sections.${index}.heading`]
                        ? "border-red-500"
                        : ""
                    }
                    value={section.heading}
                    onChange={(event) =>
                      updateSection(index, "heading", event.target.value)
                    }
                  />
                  <FieldError message={fieldErrors[`sections.${index}.heading`]} />
                </label>
                <label
                  className="block text-sm"
                  data-invalid={
                    fieldErrors[`sections.${index}.body`] ? "true" : undefined
                  }
                >
                  <span className="mb-1 block font-semibold text-[#4A2306]">
                    Body
                  </span>
                  <textarea
                    className={`min-h-28 w-full rounded-lg border px-3 py-2 ${
                      fieldErrors[`sections.${index}.body`]
                        ? "border-red-500"
                        : "border-border"
                    }`}
                    value={section.body}
                    onChange={(event) =>
                      updateSection(index, "body", event.target.value)
                    }
                  />
                  <FieldError message={fieldErrors[`sections.${index}.body`]} />
                </label>
              </div>
            ))}
          </div>

          <label className="block text-sm" data-invalid={fieldErrors.takeaway ? "true" : undefined}>
            <span className="mb-1 block font-semibold text-[#4A2306]">Takeaway</span>
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
              onClick={() => void closeForm()}
            >
              Hủy
            </Button>
            <Button type="button" disabled={saving} onClick={() => void handleSave()}>
              {saving ? "Đang lưu..." : "Lưu bài viết"}
            </Button>
          </div>
        </div>
      ) : null}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Xóa bài viết?"
        description={
          deleteTarget ? `Bài “${deleteTarget.title}” sẽ bị xóa vĩnh viễn.` : ""
        }
        busy={deleting}
        onCancel={() => {
          if (!deleting) setDeleteTarget(null);
        }}
        onConfirm={() => void handleDelete()}
      />
    </section>
  );
}
