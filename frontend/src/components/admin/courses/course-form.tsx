"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { AdminImageField } from "@/components/admin/admin-image-field";
import { TuitionField } from "./tuition-field";
import { Button } from "@/components/ui/button";
import { useCloudinaryImageReplace } from "@/hooks/use-cloudinary-image-replace";
import { scrollToFirstInvalid } from "@/lib/admin/scroll";
import { slugify } from "@/lib/admin/slugify";
import { createCourse, updateCourse } from "@/lib/courses/api";
import type {
  Course,
  CoursePayload,
  CourseRoadmap,
  CourseRoadmapStage,
} from "@/lib/courses/types";
import { ApiError, formatError } from "@/lib/errors/format-error";
import { isHttpUrl } from "@/lib/media/is-http-url";

const LEVEL_OPTIONS = [
  "Học sinh lớp 9",
  "Học sinh lớp 10",
  "Học sinh lớp 11",
  "Học sinh lớp 12",
  "A1 – C1",
  "A1 – B1",
  "A2 – B2",
  "3–6 tuổi",
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
  "Giao tiếp công việc · họp · email",
  "Yêu thích tiếng Anh · sẵn sàng vào lớp 1",
  "TOEIC 450 – 800+",
] as const;

const DURATION_OPTIONS = [
  "60 phút/buổi",
  "60–75 phút/buổi",
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
  "💼",
  "🧸",
] as const;

const CATEGORY_OPTIONS = [
  { value: "grade-10", label: "Thi vào lớp 10" },
  { value: "thpt-university", label: "THPT & đại học" },
  { value: "ielts", label: "IELTS" },
  { value: "global-success", label: "Global Success" },
  { value: "communicative", label: "Người đi làm" },
  { value: "pre-primary", label: "Tiền tiểu học" },
  { value: "toeic", label: "TOEIC" },
] as const;

const DEFAULT_COURSE_COLORS = {
  accent: "#C0470F",
  bg: "#FFF7F3",
} as const;

type FieldErrors = Partial<Record<keyof CoursePayload | "form" | "roadmap", string>>;

const EMPTY_STAGE: CourseRoadmapStage = {
  name: "",
  band: "",
  modules: [""],
};

const EMPTY_FORM: CoursePayload = {
  slug: "",
  title: "",
  subtitle: "",
  description: "",
  level: LEVEL_OPTIONS[0],
  target: TARGET_OPTIONS[0],
  tuition: "",
  duration: DURATION_OPTIONS[2],
  startDate: null,
  endDate: null,
  perks: [""],
  curriculum: [""],
  roadmap: { stages: [{ ...EMPTY_STAGE, modules: [""] }] },
  category: "",
  coverImageUrl: "",
  accent: "#F16522",
  bg: "#FFF4EC",
  icon: "📚",
  featured: true,
  sortOrder: 0,
  isPublished: true,
};

function normalizeRoadmap(roadmap: CourseRoadmap | null | undefined): CourseRoadmap | null {
  if (!roadmap?.stages?.length) return null;
  const stages = roadmap.stages
    .map((stage) => ({
      name: stage.name.trim(),
      band: stage.band?.trim() || undefined,
      modules: (stage.modules ?? []).map((item) => item.trim()).filter(Boolean),
    }))
    .filter((stage) => stage.name.length >= 2 && stage.modules.length > 0);
  return stages.length ? { stages } : null;
}

function toEditableRoadmap(roadmap: Course["roadmap"]): CourseRoadmap {
  if (roadmap?.stages?.length) {
    return {
      stages: roadmap.stages.map((stage) => ({
        name: stage.name,
        band: stage.band ?? "",
        modules: stage.modules.length ? [...stage.modules] : [""],
      })),
    };
  }
  return { stages: [{ ...EMPTY_STAGE, modules: [""] }] };
}

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
    } else if (lower.includes("startdate") || lower.includes("ngày bắt đầu")) {
      errors.startDate = "Ngày bắt đầu khóa chưa hợp lệ";
    } else if (lower.includes("enddate") || lower.includes("ngày kết thúc")) {
      errors.endDate = "Ngày kết thúc khóa chưa hợp lệ";
    } else if (lower.includes("perk")) {
      errors.perks = "Cần ít nhất 1 điểm nổi bật";
    } else if (lower.includes("curriculum")) {
      errors.curriculum = "Giáo trình chưa hợp lệ";
    } else if (lower.includes("roadmap") || lower.includes("stages")) {
      errors.roadmap = "Lộ trình chưa hợp lệ — mỗi giai đoạn cần tên + ít nhất 1 module";
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
      <span className="mb-1 block font-semibold text-foreground">{label}</span>
      <span className="mb-2 block text-xs text-muted-foreground">{hint}</span>
      <div className="flex items-center gap-3">
        <input
          type="color"
          className="h-11 w-14 cursor-pointer rounded-lg border border-border bg-card p-1"
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
      <span className="mb-1 block font-semibold text-foreground">{label}</span>
      <select
        className={`h-11 w-full rounded-lg border bg-card px-3 py-2 lg:h-auto ${
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

function normalizeCategory(category: string) {
  return CATEGORY_OPTIONS.some((option) => option.value === category)
    ? category
    : "";
}

function firstFreeSortOrder(existingCourses: Course[]) {
  const taken = new Set(existingCourses.map((course) => course.sortOrder));
  return SORT_ORDER_OPTIONS.find((order) => !taken.has(order)) ?? 0;
}

function createInitialValues(
  course: Course | null,
  existingCourses: Course[],
): CoursePayload {
  if (course) {
    return {
      slug: course.slug,
      title: course.title,
      subtitle: course.subtitle,
      description: course.description,
      level: course.level,
      target: course.target,
      tuition: course.tuition,
      duration: course.duration,
      startDate: course.startDate,
      endDate: course.endDate,
      perks: course.perks.length ? course.perks : [""],
      curriculum: course.curriculum?.length ? course.curriculum : [""],
      roadmap: toEditableRoadmap(course.roadmap),
      category: normalizeCategory(course.category),
      coverImageUrl: course.coverImageUrl,
      accent: course.accent,
      bg: course.bg,
      icon: course.icon,
      featured: course.featured,
      sortOrder: course.sortOrder,
      isPublished: course.isPublished,
    };
  }

  return { ...EMPTY_FORM, sortOrder: firstFreeSortOrder(existingCourses) };
}

type CourseFormProps = {
  course: Course | null;
  existingCourses: Course[];
  onCancel: () => void;
  onSaved: (message: string) => void;
};

export function CourseForm({
  course,
  existingCourses,
  onCancel,
  onSaved,
}: CourseFormProps) {
  const editingId = course?.id ?? null;
  const [form, setForm] = useState<CoursePayload>(() =>
    createInitialValues(course, existingCourses),
  );
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);
  /** Cover: stash/restore khi Hủy; commit khi Lưu (không live-persist DB). */
  const cover = useCloudinaryImageReplace({ category: "course-cover" });

  useEffect(() => {
    cover.reset(course?.coverImageUrl ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- remount via key on open
  }, []);

  const availableSortOrders = useMemo(() => {
    const taken = new Set(
      existingCourses
        .filter((item) => item.id !== editingId)
        .map((item) => item.sortOrder),
    );
    return SORT_ORDER_OPTIONS.filter(
      (order) => !taken.has(order) || order === form.sortOrder,
    );
  }, [existingCourses, editingId, form.sortOrder]);

  const clearFieldError = (key: keyof FieldErrors) => {
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const updateField = <K extends keyof CoursePayload>(
    key: K,
    value: CoursePayload[K],
  ) => {
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
    if (payload.tuition.trim().length < 2)
      errors.tuition = "Vui lòng nhập học phí (hoặc chọn Liên hệ tư vấn)";
    if (!normalizeCategory(payload.category)) errors.category = "Vui lòng chọn category";
    if (!isHttpUrl(payload.coverImageUrl)) {
      errors.coverImageUrl = "Chưa có ảnh cover — vui lòng chọn ảnh rồi lưu";
    }
    if (!availableSortOrders.includes(payload.sortOrder ?? -1)) {
      errors.sortOrder = "Thứ tự này đã được dùng — chọn số khác";
    }
    const startDate = payload.startDate?.trim() || "";
    const endDate = payload.endDate?.trim() || "";
    if (startDate && endDate && endDate < startDate) {
      errors.endDate = "Ngày kết thúc khóa phải sau hoặc bằng ngày bắt đầu.";
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

  const handleCancel = async () => {
    await cover.discard();
    cover.reset(null);
    onCancel();
  };

  const handleSave = async () => {
    setSaving(true);
    clearFieldError("form");

    const category = normalizeCategory(form.category);
    const roadmap = normalizeRoadmap(form.roadmap);
    const payload: CoursePayload = {
      ...form,
      category,
      title: form.title.trim(),
      slug: form.slug.trim(),
      subtitle: form.subtitle.trim(),
      description: form.description.trim(),
      perks: form.perks.map((item) => item.trim()).filter(Boolean),
      curriculum: (form.curriculum ?? []).map((item) => item.trim()).filter(Boolean),
      roadmap,
      startDate: form.startDate || null,
      endDate: form.endDate || null,
    };

    const localErrors = validateForm(payload);
    if (Object.keys(localErrors).length > 0) {
      setFieldErrors(localErrors);
      setSaving(false);
      scrollToFirstInvalid(formRef.current);
      return;
    }

    try {
      const response = editingId
        ? await updateCourse(editingId, payload)
        : await createCourse(payload);
      await cover.commit(payload.coverImageUrl);
      cover.reset(null);
      onSaved(response.message);
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

  return (
    <div
      ref={formRef}
      className="scroll-mt-6 space-y-4 rounded-2xl border border-border bg-card p-5"
    >
      <h3 className="text-lg font-black text-foreground font-[family-name:var(--font-nunito)]">
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
            <span className="mb-1 block font-semibold text-foreground">{label}</span>
            <input
              className={`h-11 w-full rounded-lg border px-3 py-2 lg:h-auto ${
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
        <TuitionField
          value={form.tuition}
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
          <span className="mb-1 block font-semibold text-foreground">Ngày bắt đầu khóa (tuỳ chọn)</span>
          <input
            type="date"
            className={`h-11 w-full rounded-lg border bg-card px-3 py-2 lg:h-auto ${
              fieldErrors.startDate ? "border-red-500" : "border-border"
            }`}
            value={form.startDate ?? ""}
            onChange={(event) => updateField("startDate", event.target.value || null)}
          />
          <FieldError message={fieldErrors.startDate} />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-semibold text-foreground">Ngày kết thúc khóa (tuỳ chọn)</span>
          <input
            type="date"
            className={`h-11 w-full rounded-lg border bg-card px-3 py-2 lg:h-auto ${
              fieldErrors.endDate ? "border-red-500" : "border-border"
            }`}
            value={form.endDate ?? ""}
            min={form.startDate ?? undefined}
            onChange={(event) => updateField("endDate", event.target.value || null)}
          />
          <FieldError message={fieldErrors.endDate} />
        </label>

        <label className="block text-sm">
          <span className="mb-1 block font-semibold text-foreground">Thứ tự hiển thị</span>
          <select
            className={`h-11 w-full rounded-lg border bg-card px-3 py-2 lg:h-auto ${
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
          <span className="mb-1 block font-semibold text-foreground">Category (lọc sidebar)</span>
          <select
            className={`h-11 w-full rounded-lg border bg-card px-3 py-2 lg:h-auto ${
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
          <span className="mb-1 block text-sm font-semibold text-foreground">Icon card</span>
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
                      : "border-border bg-card hover:bg-secondary"
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
            <span className="block text-sm font-semibold text-foreground">Màu card</span>
            <span className="text-xs text-muted-foreground">
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
        <span className="mb-1 block font-semibold text-foreground">Mô tả</span>
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
        <span className="mb-1 block font-semibold text-foreground">
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

      <label className="block text-sm">
        <span className="mb-1 block font-semibold text-foreground">
          Giáo trình sơ lược (mỗi dòng 1 mục)
        </span>
        <textarea
          className={`min-h-28 w-full rounded-lg border px-3 py-2 ${
            fieldErrors.curriculum ? "border-red-500" : "border-border"
          }`}
          value={(form.curriculum ?? []).join("\n")}
          placeholder={"Listening Part 1–4\nReading Part 5–7\nTừ vựng & ngữ pháp"}
          onChange={(event) =>
            updateField("curriculum", event.target.value.split("\n"))
          }
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Hiện ở khối “Giáo trình sơ lược” trên trang khóa học (có thể để trống).
        </p>
        <FieldError message={fieldErrors.curriculum} />
      </label>

      <div className="space-y-3 rounded-xl border border-border bg-secondary/40 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h4 className="text-sm font-black text-foreground font-[family-name:var(--font-nunito)]">
              Lộ trình học (đồ họa cột)
            </h4>
            <p className="text-xs text-muted-foreground">
              Mỗi giai đoạn = 1 cột. Band là nhãn trên cột (vd. 5.5+, Cơ bản). Module = nội dung
              dưới cột.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              setForm((prev) => ({
                ...prev,
                roadmap: {
                  stages: [
                    ...(prev.roadmap?.stages ?? []),
                    { ...EMPTY_STAGE, modules: [""] },
                  ],
                },
              }))
            }
          >
            + Thêm giai đoạn
          </Button>
        </div>

        {(form.roadmap?.stages ?? []).map((stage, index) => (
          <div
            key={`stage-${index}`}
            className="space-y-2 rounded-lg border border-border bg-card p-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Giai đoạn {index + 1}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={(form.roadmap?.stages.length ?? 0) <= 1}
                onClick={() =>
                  setForm((prev) => {
                    const stages = [...(prev.roadmap?.stages ?? [])];
                    stages.splice(index, 1);
                    return {
                      ...prev,
                      roadmap: { stages: stages.length ? stages : [{ ...EMPTY_STAGE, modules: [""] }] },
                    };
                  })
                }
              >
                Xóa
              </Button>
            </div>
            <div className="grid gap-2 md:grid-cols-2">
              <label className="block text-sm">
                <span className="mb-1 block font-semibold text-foreground">Tên giai đoạn</span>
                <input
                  className="h-11 w-full rounded-lg border border-border px-3 py-2 lg:h-auto"
                  value={stage.name}
                  placeholder="VD: IELTS khởi động"
                  onChange={(event) => {
                    clearFieldError("roadmap");
                    setForm((prev) => {
                      const stages = [...(prev.roadmap?.stages ?? [])];
                      stages[index] = { ...stages[index], name: event.target.value };
                      return { ...prev, roadmap: { stages } };
                    });
                  }}
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-semibold text-foreground">
                  Band / nhãn cột (tuỳ chọn)
                </span>
                <input
                  className="h-11 w-full rounded-lg border border-border px-3 py-2 lg:h-auto"
                  value={stage.band ?? ""}
                  placeholder="VD: 5.5+ → 6.5+"
                  onChange={(event) => {
                    clearFieldError("roadmap");
                    setForm((prev) => {
                      const stages = [...(prev.roadmap?.stages ?? [])];
                      stages[index] = { ...stages[index], band: event.target.value };
                      return { ...prev, roadmap: { stages } };
                    });
                  }}
                />
              </label>
            </div>
            <label className="block text-sm">
              <span className="mb-1 block font-semibold text-foreground">
                Modules (mỗi dòng 1 ý)
              </span>
              <textarea
                className="min-h-20 w-full rounded-lg border border-border px-3 py-2"
                value={(stage.modules ?? []).join("\n")}
                placeholder={"Basic English\nPhát âm & từ vựng lõi"}
                onChange={(event) => {
                  clearFieldError("roadmap");
                  setForm((prev) => {
                    const stages = [...(prev.roadmap?.stages ?? [])];
                    stages[index] = {
                      ...stages[index],
                      modules: event.target.value.split("\n"),
                    };
                    return { ...prev, roadmap: { stages } };
                  });
                }}
              />
            </label>
          </div>
        ))}
        <FieldError message={fieldErrors.roadmap} />
        <p className="text-xs text-muted-foreground">
          Để trống hết giai đoạn → trang public sẽ ẩn khối lộ trình.
        </p>
      </div>

      <AdminImageField
        label="Cover"
        url={form.coverImageUrl}
        uploading={cover.uploading}
        invalid={Boolean(fieldErrors.coverImageUrl)}
        error={fieldErrors.coverImageUrl}
        onFile={(file) => void handleUpload(file)}
      />

      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <input
            type="checkbox"
            checked={Boolean(form.featured)}
            onChange={(event) => updateField("featured", event.target.checked)}
          />
          Featured (hiện trang chủ)
        </label>
        <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
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
        <Button type="button" variant="outline" onClick={() => void handleCancel()}>
          Hủy
        </Button>
        {!isHttpUrl(form.coverImageUrl) ? (
          <span className="text-xs text-red-600">Bắt buộc có ảnh cover mới lưu được</span>
        ) : null}
      </div>
    </div>
  );
}
