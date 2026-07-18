"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { AdminImageField } from "@/components/admin/admin-image-field";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Button } from "@/components/ui/button";
import { useCloudinaryImageReplace } from "@/hooks/use-cloudinary-image-replace";
import { scrollToFirstInvalid } from "@/lib/admin/scroll";
import { slugify } from "@/lib/admin/slugify";
import {
  createCourse,
  deleteCourse,
  listCourses,
  updateCourse,
} from "@/lib/courses/api";
import type { Course, CoursePayload } from "@/lib/courses/types";
import { ApiError, formatError } from "@/lib/errors/format-error";
import { isHttpUrl } from "@/lib/media/is-http-url";

const LEVEL_OPTIONS = [
  "Học sinh lớp 9",
  "Học sinh lớp 10",
  "Học sinh lớp 11",
  "Học sinh lớp 12",
  "A1 – C1",
  "Lớp 1–9 · Pre-A1 – B1+",
  "Mọi trình độ",
] as const;

const TARGET_OPTIONS = [
  "Kỳ thi tuyển sinh lớp 10",
  "Tốt nghiệp THPT · Đại học",
  "IELTS 5.0 – 7.0+",
  "IELTS 6.5 – 8.0+",
  "Phát triển toàn diện 4 kỹ năng",
  "Giao tiếp thực tế",
] as const;

const TUITION_OPTIONS = [
  "120.000 ₫/buổi",
  "150.000 ₫/buổi",
  "200.000 ₫/buổi",
  "300.000 – 500.000 ₫/buổi",
  "Liên hệ tư vấn",
] as const;

const DURATION_OPTIONS = [
  "60 phút/buổi",
  "90 phút/buổi",
  "120 phút/buổi",
  "Theo khối lớp",
] as const;

const SORT_ORDER_OPTIONS = Array.from({ length: 21 }, (_, index) => index);

const COURSE_ICONS = [
  "🥇",
  "🎓",
  "🎯",
  "📚",
  "✏️",
  "📝",
  "🗣️",
  "🎧",
  "🏆",
  "⭐",
  "🧠",
  "💡",
  "🌍",
  "📖",
  "🧑‍🏫",
  "🔥",
] as const;

const CATEGORY_OPTIONS = [
  { value: "grade-10", label: "Thi vào lớp 10" },
  { value: "thpt-university", label: "THPT & Đại học" },
  { value: "ielts", label: "IELTS" },
  { value: "global-success", label: "Global Success" },
] as const;

const DEFAULT_COURSE_COLORS = {
  accent: "#C0470F",
  bg: "#FFF7F3",
} as const;

type FieldErrors = Partial<Record<keyof CoursePayload | "form", string>>;

const EMPTY_FORM: CoursePayload = {
  slug: "",
  title: "",
  subtitle: "",
  description: "",
  level: LEVEL_OPTIONS[0],
  target: TARGET_OPTIONS[0],
  tuition: TUITION_OPTIONS[0],
  duration: DURATION_OPTIONS[1],
  perks: [""],
  category: "",
  coverImageUrl: "",
  accent: "#F16522",
  bg: "#FFF4EC",
  icon: "📚",
  featured: true,
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

function mapServerFieldErrors(message: string): FieldErrors {
  const errors: FieldErrors = {};
  const chunks = message.split(/\. (?=[a-zA-Z])/);

  for (const chunk of chunks) {
    const text = chunk.trim();
    const lower = text.toLowerCase();

    if (lower.includes("coverimageurl")) {
      errors.coverImageUrl = "Ảnh cover chưa hợp lệ — hãy tải ảnh lên hoặc dán URL https";
    } else if (lower.includes("description")) {
      errors.description = "Mô tả cần tối thiểu 10 ký tự";
    } else if (lower.includes("subtitle")) {
      errors.subtitle = "Subtitle chưa hợp lệ";
    } else if (lower.includes("title")) {
      errors.title = "Tiêu đề chưa hợp lệ";
    } else if (lower.includes("slug")) {
      errors.slug = "Slug chưa hợp lệ (chữ thường, số, dấu gạch ngang)";
    } else if (lower.includes("category")) {
      errors.category = "Vui lòng chọn category";
    } else if (lower.includes("level")) {
      errors.level = "Trình độ chưa hợp lệ";
    } else if (lower.includes("target")) {
      errors.target = "Mục tiêu chưa hợp lệ";
    } else if (lower.includes("tuition")) {
      errors.tuition = "Học phí chưa hợp lệ";
    } else if (lower.includes("duration")) {
      errors.duration = "Thời gian chưa hợp lệ";
    } else if (lower.includes("perk")) {
      errors.perks = "Cần ít nhất 1 điểm nổi bật";
    } else if (text) {
      errors.form = errors.form ? `${errors.form}. ${text}` : text;
    }
  }

  return errors;
}

function ColorField({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-semibold text-[#4A2306]">{label}</span>
      <span className="mb-2 block text-xs text-[#9B6B50]">{hint}</span>
      <div className="flex items-center gap-3">
        <input
          type="color"
          className="h-11 w-14 cursor-pointer rounded-lg border border-border bg-white p-1"
          value={/^#[0-9A-Fa-f]{6}$/.test(value) ? value : "#F16522"}
          onChange={(event) => onChange(event.target.value.toUpperCase())}
        />
        <input
          className="min-w-0 flex-1 rounded-lg border border-border px-3 py-2 font-mono text-sm uppercase"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="#F16522"
        />
        <span
          className="h-11 w-11 shrink-0 rounded-lg border border-border"
          style={{ background: value || "#F16522" }}
          aria-hidden="true"
        />
      </div>
    </label>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
  error,
}: {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
  error?: string;
}) {
  const hasCurrent = !value || options.includes(value);

  return (
    <label className="block text-sm">
      <span className="mb-1 block font-semibold text-[#4A2306]">{label}</span>
      <select
        className={`w-full rounded-lg border bg-white px-3 py-2 ${
          error ? "border-red-500" : "border-border"
        }`}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {!hasCurrent ? <option value={value}>{value}</option> : null}
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <FieldError message={error} />
    </label>
  );
}

export function CoursesAdmin() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CoursePayload>(EMPTY_FORM);
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Course | null>(null);
  const [deleting, setDeleting] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  /** Cover: stash/restore khi Hủy; commit khi Lưu (không live-persist DB). */
  const cover = useCloudinaryImageReplace({ category: "course-cover" });

  const availableSortOrders = useMemo(() => {
    const taken = new Set(
      courses
        .filter((course) => course.id !== editingId)
        .map((course) => course.sortOrder),
    );
    return SORT_ORDER_OPTIONS.filter(
      (order) => !taken.has(order) || order === form.sortOrder,
    );
  }, [courses, editingId, form.sortOrder]);

  const load = async () => {
    setLoading(true);
    setListError(null);
    try {
      const response = await listCourses({ publishedOnly: false });
      setCourses(response.courses);
    } catch (err) {
      setListError(formatError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  useEffect(() => {
    if (!showForm) return;
    const id = window.setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
    return () => window.clearTimeout(id);
  }, [showForm, editingId]);

  const normalizeCategory = (category: string) =>
    CATEGORY_OPTIONS.some((option) => option.value === category) ? category : "";

  const firstFreeSortOrder = () => {
    const taken = new Set(courses.map((course) => course.sortOrder));
    return SORT_ORDER_OPTIONS.find((order) => !taken.has(order)) ?? 0;
  };

  const clearFieldError = (key: keyof FieldErrors) => {
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
    setForm({ ...EMPTY_FORM, sortOrder: firstFreeSortOrder() });
    setShowForm(true);
  };

  const openEdit = async (course: Course) => {
    await cover.discard();
    setEditingId(course.id);
    setFieldErrors({});
    cover.reset(course.coverImageUrl);
    setForm({
      slug: course.slug,
      title: course.title,
      subtitle: course.subtitle,
      description: course.description,
      level: course.level,
      target: course.target,
      tuition: course.tuition,
      duration: course.duration,
      perks: course.perks.length ? course.perks : [""],
      category: normalizeCategory(course.category),
      coverImageUrl: course.coverImageUrl,
      accent: course.accent,
      bg: course.bg,
      icon: course.icon,
      featured: course.featured,
      sortOrder: course.sortOrder,
      isPublished: course.isPublished,
    });
    setShowForm(true);
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

  const updateField = <K extends keyof CoursePayload>(key: K, value: CoursePayload[K]) => {
    clearFieldError(key);
    clearFieldError("form");
    if (key === "title" && !editingId) clearFieldError("slug");
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "title" && !editingId) {
        next.slug = slugify(String(value));
      }
      return next;
    });
  };

  const validateForm = (payload: CoursePayload): FieldErrors => {
    const errors: FieldErrors = {};

    if (payload.title.trim().length < 2) errors.title = "Tiêu đề cần tối thiểu 2 ký tự";
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(payload.slug)) {
      errors.slug = "Slug chỉ gồm chữ thường, số và dấu gạch ngang";
    }
    if (payload.subtitle.trim().length < 2) errors.subtitle = "Subtitle cần tối thiểu 2 ký tự";
    if (payload.description.trim().length < 10) {
      errors.description = "Mô tả cần tối thiểu 10 ký tự";
    }
    if (!payload.perks.length) errors.perks = "Nhập ít nhất 1 điểm nổi bật";
    if (!normalizeCategory(payload.category)) errors.category = "Vui lòng chọn category";
    if (!isHttpUrl(payload.coverImageUrl)) {
      errors.coverImageUrl =
        "Chưa có ảnh cover — vui lòng chọn ảnh rồi lưu";
    }
    if (!availableSortOrders.includes(payload.sortOrder ?? -1)) {
      errors.sortOrder = "Thứ tự này đã được dùng — chọn số khác";
    }

    return errors;
  };

  const handleUpload = async (file: File | null) => {
    clearFieldError("coverImageUrl");
    clearFieldError("form");
    try {
      const url = await cover.upload(file);
      if (!url) return;
      setForm((prev) => ({ ...prev, coverImageUrl: url }));
      clearFieldError("coverImageUrl");
    } catch (err) {
      setFieldErrors((prev) => ({
        ...prev,
        coverImageUrl: formatError(err) || "Upload ảnh thất bại",
      }));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    clearFieldError("form");

    const category = normalizeCategory(form.category);
    const payload: CoursePayload = {
      ...form,
      category,
      title: form.title.trim(),
      slug: form.slug.trim(),
      subtitle: form.subtitle.trim(),
      description: form.description.trim(),
      perks: form.perks.map((item) => item.trim()).filter(Boolean),
    };

    const localErrors = validateForm(payload);
    if (Object.keys(localErrors).length > 0) {
      setFieldErrors(localErrors);
      setSaving(false);
      scrollToFirstInvalid(formRef.current);
      return;
    }

    try {
      if (editingId) {
        await updateCourse(editingId, payload);
      } else {
        await createCourse(payload);
      }
      await cover.commit(payload.coverImageUrl);
      setShowForm(false);
      setEditingId(null);
      setForm(EMPTY_FORM);
      setFieldErrors({});
      cover.reset(null);
      await load();
    } catch (err) {
      if (err instanceof ApiError) {
        const mapped = mapServerFieldErrors(err.message);
        setFieldErrors(mapped);
      } else {
        setFieldErrors({ form: formatError(err) });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setListError(null);
    try {
      await deleteCourse(deleteTarget.id);
      if (editingId === deleteTarget.id) await closeForm();
      setDeleteTarget(null);
      await load();
    } catch (err) {
      setListError(formatError(err));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-black text-[#4A2306] font-[family-name:var(--font-nunito)]">
          Khóa học
        </h2>
        <Button
          type="button"
          variant={showForm && !editingId ? "outline" : "primary"}
          onClick={() => void toggleCreateForm()}
        >
          {showForm && !editingId ? "Đóng form thêm" : "Thêm khóa học"}
        </Button>
      </div>

      {listError ? <p className="text-sm text-red-600">{listError}</p> : null}
      {loading ? <p className="text-sm text-[#9B6B50]">Đang tải...</p> : null}

      <div className="overflow-x-auto rounded-2xl border border-border bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-border bg-[#FFF9F5] text-[#9B6B50]">
            <tr>
              <th className="px-4 py-3 font-semibold">Khóa</th>
              <th className="px-4 py-3 font-semibold">Category</th>
              <th className="px-4 py-3 font-semibold">Featured</th>
              <th className="px-4 py-3 font-semibold">Published</th>
              <th className="px-4 py-3 font-semibold">Order</th>
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course) => (
              <tr key={course.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3">
                  <div className="font-semibold text-[#4A2306]">{course.title}</div>
                  <div className="text-xs text-[#9B6B50]">{course.slug}</div>
                </td>
                <td className="px-4 py-3">{course.category}</td>
                <td className="px-4 py-3">{course.featured ? "Có" : "Không"}</td>
                <td className="px-4 py-3">{course.isPublished ? "Có" : "Ẩn"}</td>
                <td className="px-4 py-3">{course.sortOrder}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => void openEdit(course)}
                    >
                      Sửa
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setDeleteTarget(course)}
                    >
                      Xóa
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm ? (
        <div
          ref={formRef}
          className="scroll-mt-6 space-y-4 rounded-2xl border border-border bg-white p-5"
        >
          <h3 className="text-lg font-black text-[#4A2306] font-[family-name:var(--font-nunito)]">
            {editingId ? "Sửa khóa học" : "Thêm khóa học"}
          </h3>

          {fieldErrors.form ? <p className="text-sm text-red-600">{fieldErrors.form}</p> : null}

          <div className="grid gap-4 md:grid-cols-2">
            {(
              [
                ["title", "Tiêu đề"],
                ["slug", "Slug"],
                ["subtitle", "Subtitle"],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="block text-sm">
                <span className="mb-1 block font-semibold text-[#4A2306]">{label}</span>
                <input
                  className={`w-full rounded-lg border px-3 py-2 ${
                    fieldErrors[key] ? "border-red-500" : "border-border"
                  }`}
                  value={String(form[key] ?? "")}
                  onChange={(event) => updateField(key, event.target.value)}
                />
                <FieldError message={fieldErrors[key]} />
              </label>
            ))}

            <SelectField
              label="Trình độ"
              value={form.level}
              options={LEVEL_OPTIONS}
              error={fieldErrors.level}
              onChange={(value) => updateField("level", value)}
            />
            <SelectField
              label="Mục tiêu"
              value={form.target}
              options={TARGET_OPTIONS}
              error={fieldErrors.target}
              onChange={(value) => updateField("target", value)}
            />
            <SelectField
              label="Học phí"
              value={form.tuition}
              options={TUITION_OPTIONS}
              error={fieldErrors.tuition}
              onChange={(value) => updateField("tuition", value)}
            />
            <SelectField
              label="Thời gian"
              value={form.duration}
              options={DURATION_OPTIONS}
              error={fieldErrors.duration}
              onChange={(value) => updateField("duration", value)}
            />

            <label className="block text-sm">
              <span className="mb-1 block font-semibold text-[#4A2306]">Thứ tự hiển thị</span>
              <select
                className={`w-full rounded-lg border bg-white px-3 py-2 ${
                  fieldErrors.sortOrder ? "border-red-500" : "border-border"
                }`}
                value={String(form.sortOrder ?? "")}
                onChange={(event) => updateField("sortOrder", Number(event.target.value))}
              >
                {availableSortOrders.length === 0 ? (
                  <option value="">Hết slot thứ tự</option>
                ) : (
                  availableSortOrders.map((order) => (
                    <option key={order} value={order}>
                      {order}
                    </option>
                  ))
                )}
              </select>
              <FieldError message={fieldErrors.sortOrder} />
            </label>

            <label className="block text-sm md:col-span-2">
              <span className="mb-1 block font-semibold text-[#4A2306]">Category (lọc sidebar)</span>
              <select
                className={`w-full rounded-lg border bg-white px-3 py-2 ${
                  fieldErrors.category ? "border-red-500" : "border-border"
                }`}
                value={normalizeCategory(form.category)}
                onChange={(event) => updateField("category", event.target.value)}
              >
                <option value="">Chọn category</option>
                {CATEGORY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label} ({option.value})
                  </option>
                ))}
              </select>
              <FieldError message={fieldErrors.category} />
            </label>

            <div className="md:col-span-2">
              <span className="mb-1 block text-sm font-semibold text-[#4A2306]">Icon card</span>
              <div className="flex flex-wrap gap-2">
                {COURSE_ICONS.map((icon) => {
                  const active = form.icon === icon;
                  return (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => updateField("icon", icon)}
                      className={`flex h-11 w-11 items-center justify-center rounded-xl border text-xl transition-colors ${
                        active
                          ? "border-primary bg-secondary"
                          : "border-border bg-white hover:bg-secondary"
                      }`}
                      aria-label={`Chọn icon ${icon}`}
                      aria-pressed={active}
                    >
                      {icon}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-wrap items-end justify-between gap-3 md:col-span-2">
              <div>
                <span className="block text-sm font-semibold text-[#4A2306]">Màu card</span>
                <span className="text-xs text-[#9B6B50]">
                  Màu gốc: accent {DEFAULT_COURSE_COLORS.accent} · nền {DEFAULT_COURSE_COLORS.bg}
                </span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setForm((prev) => ({
                    ...prev,
                    accent: DEFAULT_COURSE_COLORS.accent,
                    bg: DEFAULT_COURSE_COLORS.bg,
                  }))
                }
              >
                Reset màu gốc
              </Button>
            </div>

            <ColorField
              label="Màu nhấn (accent)"
              hint="Dải gradient phủ đáy ảnh card."
              value={form.accent || DEFAULT_COURSE_COLORS.accent}
              onChange={(value) => updateField("accent", value)}
            />
            <ColorField
              label="Màu nền ảnh (background)"
              hint="Nền phía sau cover khi ảnh chưa kịp load."
              value={form.bg || DEFAULT_COURSE_COLORS.bg}
              onChange={(value) => updateField("bg", value)}
            />
          </div>

          <label className="block text-sm">
            <span className="mb-1 block font-semibold text-[#4A2306]">Mô tả</span>
            <textarea
              className={`min-h-28 w-full rounded-lg border px-3 py-2 ${
                fieldErrors.description ? "border-red-500" : "border-border"
              }`}
              value={form.description}
              onChange={(event) => updateField("description", event.target.value)}
            />
            <FieldError message={fieldErrors.description} />
          </label>

          <label className="block text-sm">
            <span className="mb-1 block font-semibold text-[#4A2306]">
              Điểm nổi bật (mỗi dòng 1 ý)
            </span>
            <textarea
              className={`min-h-28 w-full rounded-lg border px-3 py-2 ${
                fieldErrors.perks ? "border-red-500" : "border-border"
              }`}
              value={form.perks.join("\n")}
              onChange={(event) => updateField("perks", event.target.value.split("\n"))}
            />
            <FieldError message={fieldErrors.perks} />
          </label>

          <AdminImageField
            label="Cover"
            url={form.coverImageUrl}
            uploading={cover.uploading}
            invalid={Boolean(fieldErrors.coverImageUrl)}
            error={fieldErrors.coverImageUrl}
            onFile={(file) => void handleUpload(file)}
          />

          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm font-semibold text-[#4A2306]">
              <input
                type="checkbox"
                checked={Boolean(form.featured)}
                onChange={(event) => updateField("featured", event.target.checked)}
              />
              Featured (hiện trang chủ)
            </label>
            <label className="flex items-center gap-2 text-sm font-semibold text-[#4A2306]">
              <input
                type="checkbox"
                checked={Boolean(form.isPublished)}
                onChange={(event) => updateField("isPublished", event.target.checked)}
              />
              Published (hiện public)
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              onClick={() => void handleSave()}
              disabled={saving || cover.uploading || !isHttpUrl(form.coverImageUrl)}
              title={
                !isHttpUrl(form.coverImageUrl)
                  ? "Phải upload ảnh cover trước khi lưu"
                  : undefined
              }
            >
              {cover.uploading ? "Đang upload..." : saving ? "Đang lưu..." : "Lưu"}
            </Button>
            <Button type="button" variant="outline" onClick={() => void closeForm()}>
              Hủy
            </Button>
            {!isHttpUrl(form.coverImageUrl) ? (
              <span className="text-xs text-red-600">Bắt buộc có ảnh cover mới lưu được</span>
            ) : null}
          </div>
        </div>
      ) : null}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Xóa khóa học?"
        description={
          deleteTarget
            ? `Bạn chắc muốn xóa khóa “${deleteTarget.title}”?`
            : ""
        }
        busy={deleting}
        onCancel={() => {
          if (!deleting) setDeleteTarget(null);
        }}
        onConfirm={() => void handleDelete()}
      />
    </div>
  );
}
