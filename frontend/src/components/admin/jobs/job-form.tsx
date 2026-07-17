"use client";

import { useRef, useState } from "react";
import { BriefcaseBusiness, Plus, Save, Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createJob, updateJob } from "@/lib/jobs/api";
import type { Job, JobFormValues, SalaryType } from "@/lib/jobs/types";
import {
  hasJobFormErrors,
  normalizeJobPayload,
  type JobFormErrors,
  validateJobForm,
} from "@/lib/jobs/validation";
import { ApiError, formatError } from "@/lib/errors/format-error";

const ERROR_INPUT_CLASS =
  "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-200";

const EMPLOYMENT_TYPES = [
  { value: "FULL_TIME", label: "Full-time" },
  { value: "PART_TIME", label: "Part-time" },
  { value: "INTERNSHIP", label: "Thực tập" },
  { value: "FREELANCE", label: "Freelance" },
  { value: "CONTRACT", label: "Hợp đồng" },
] as const;

const EMPLOYMENT_TYPE_ALIASES: Record<string, string> = {
  fulltime: "FULL_TIME",
  "full-time": "FULL_TIME",
  "full time": "FULL_TIME",
  "toàn thời gian": "FULL_TIME",
  parttime: "PART_TIME",
  "part-time": "PART_TIME",
  "part time": "PART_TIME",
  "bán thời gian": "PART_TIME",
  internship: "INTERNSHIP",
  "thực tập": "INTERNSHIP",
  freelance: "FREELANCE",
  contract: "CONTRACT",
  "hợp đồng": "CONTRACT",
};

function getEmploymentTypeValue(type: string) {
  const normalizedType = type.trim().toLocaleLowerCase("vi-VN");
  return (
    EMPLOYMENT_TYPES.find(
      (employmentType) =>
        employmentType.value.toLocaleLowerCase("vi-VN") === normalizedType ||
        employmentType.label.toLocaleLowerCase("vi-VN") === normalizedType,
    )?.value ?? EMPLOYMENT_TYPE_ALIASES[normalizedType] ?? ""
  );
}

function getEmploymentTypeLabel(value: string) {
  return (
    EMPLOYMENT_TYPES.find((employmentType) => employmentType.value === value)
      ?.label ?? value
  );
}

function createInitialValues(job: Job | null, sortOrder: number): JobFormValues {
  if (job) {
    return {
      title: job.title,
      type: getEmploymentTypeValue(job.type),
      location: job.location,
      salaryType: job.salaryType ?? "NEGOTIABLE",
      salaryMin: job.salaryMin === null ? "" : String(job.salaryMin),
      salaryMax: job.salaryMax === null ? "" : String(job.salaryMax),
      currency: job.currency ?? "VND",
      duties: [...job.duties],
      benefits: [...job.benefits],
      req: job.req,
      sortOrder: String(job.sortOrder),
      isPublished: job.isPublished,
    };
  }

  return {
    title: "",
    type: "",
    location: "",
    salaryType: "",
    salaryMin: "",
    salaryMax: "",
    currency: "VND",
    duties: [""],
    benefits: [""],
    req: "",
    sortOrder: String(sortOrder),
    isPublished: true,
  };
}

type JobFormProps = {
  job: Job | null;
  nextSortOrder: number;
  onCancel: () => void;
  onSaved: (message: string) => void;
};

type ItemField = "duties" | "benefits";

export function JobForm({
  job,
  nextSortOrder,
  onCancel,
  onSaved,
}: JobFormProps) {
  const [values, setValues] = useState(() =>
    createInitialValues(job, nextSortOrder),
  );
  const [errors, setErrors] = useState<JobFormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  function clearError(field: keyof JobFormErrors) {
    setErrors((current) => ({ ...current, [field]: undefined }));
    setFormError(null);
  }

  function updateText(
    field:
      | "title"
      | "type"
      | "location"
      | "salaryMin"
      | "salaryMax"
      | "req"
      | "sortOrder",
    value: string,
  ) {
    setValues((current) => ({ ...current, [field]: value }));
    clearError(field);
  }

  function updateSalaryType(salaryType: SalaryType) {
    setValues((current) => ({
      ...current,
      salaryType,
      salaryMin: salaryType === "NEGOTIABLE" ? "" : current.salaryMin,
      salaryMax: salaryType === "RANGE" ? current.salaryMax : "",
    }));
    setErrors((current) => ({
      ...current,
      salaryType: undefined,
      salaryMin: undefined,
      salaryMax: undefined,
      currency: undefined,
    }));
    setFormError(null);
  }

  function updateItem(field: ItemField, index: number, value: string) {
    setValues((current) => ({
      ...current,
      [field]: current[field].map((item, itemIndex) =>
        itemIndex === index ? value : item,
      ),
    }));
    setErrors((current) => ({
      ...current,
      [field]: current[field]?.map((error, errorIndex) =>
        errorIndex === index ? "" : error,
      ),
      [`${field}General`]: undefined,
    }));
    setFormError(null);
  }

  function addItem(field: ItemField) {
    setValues((current) => {
      if (current[field].length >= 30) return current;
      return { ...current, [field]: [...current[field], ""] };
    });
    clearError(`${field}General`);
  }

  function removeItem(field: ItemField, index: number) {
    setValues((current) => ({
      ...current,
      [field]: current[field].filter((_, itemIndex) => itemIndex !== index),
    }));
    setErrors((current) => ({
      ...current,
      [field]: current[field]?.filter((_, errorIndex) => errorIndex !== index),
      [`${field}General`]: undefined,
    }));
    setFormError(null);
  }

  function focusFirstInvalidField() {
    window.requestAnimationFrame(() => {
      formRef.current
        ?.querySelector<HTMLElement>('[aria-invalid="true"]')
        ?.focus();
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const nextErrors = validateJobForm(values);
    setErrors(nextErrors);
    if (hasJobFormErrors(nextErrors)) {
      setFormError("Vui lòng kiểm tra và sửa các trường được đánh dấu.");
      focusFirstInvalidField();
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...normalizeJobPayload(values),
        type: getEmploymentTypeLabel(values.type),
      };
      const response = job
        ? await updateJob(job.id, payload)
        : await createJob(payload);
      onSaved(response.message);
    } catch (error) {
      if (
        error instanceof ApiError &&
        error.status === 409 &&
        error.message.includes("Thứ tự hiển thị")
      ) {
        setErrors((current) => ({
          ...current,
          sortOrder: error.message,
        }));
      }
      setFormError(formatError(error));
      focusFirstInvalidField();
    } finally {
      setSaving(false);
    }
  }

  function renderItemList(
    field: ItemField,
    legend: string,
    addLabel: string,
  ) {
    const generalError = errors[`${field}General`];

    return (
      <fieldset className="space-y-3 rounded-xl border border-border bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <legend className="font-bold text-[#4A2306]">{legend}</legend>
            <p className="mt-1 text-xs text-[#9B6B50]">
              Từ 1 đến 30 mục, mỗi mục tối đa 500 ký tự.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={saving || values[field].length >= 30}
            onClick={() => addItem(field)}
          >
            <Plus className="size-4" aria-hidden="true" />
            {addLabel}
          </Button>
        </div>

        {generalError ? (
          <p role="alert" className="text-sm font-medium text-red-600">
            {generalError}
          </p>
        ) : null}

        <div className="space-y-3">
          {values[field].map((item, index) => {
            const error = errors[field]?.[index];
            const inputId = `job-${field}-${index}`;
            const errorId = `${inputId}-error`;
            return (
              <div key={inputId} className="flex items-start gap-2">
                <div className="min-w-0 flex-1">
                  <Label htmlFor={inputId} className="sr-only">
                    {legend} {index + 1}
                  </Label>
                  <Input
                    id={inputId}
                    value={item}
                    maxLength={500}
                    disabled={saving}
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? errorId : undefined}
                    className={`bg-white ${error ? ERROR_INPUT_CLASS : ""}`}
                    placeholder={`${legend} ${index + 1}`}
                    onChange={(event) =>
                      updateItem(field, index, event.target.value)
                    }
                  />
                  {error ? (
                    <p id={errorId} className="mt-1 text-xs font-medium text-red-600">
                      {error}
                    </p>
                  ) : null}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="size-12 shrink-0 p-0"
                  disabled={saving || values[field].length === 1}
                  aria-label={`Xóa ${legend.toLowerCase()} ${index + 1}`}
                  onClick={() => removeItem(field, index)}
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                </Button>
              </div>
            );
          })}
        </div>
      </fieldset>
    );
  }

  return (
    <form
      ref={formRef}
      noValidate
      onSubmit={handleSubmit}
      className="scroll-mt-6 space-y-6 rounded-2xl border border-border bg-white p-5 shadow-[0_4px_24px_rgba(74,35,6,0.04)] sm:p-6"
      aria-labelledby="job-form-title"
    >
      <div className="flex items-start justify-between gap-4 border-b border-border pb-4">
        <div>
          <h3
            id="job-form-title"
            className="flex items-center gap-2 text-lg font-black text-[#4A2306] font-[family-name:var(--font-nunito)]"
          >
            <BriefcaseBusiness className="size-5 text-primary" aria-hidden="true" />
            {job ? "Chỉnh sửa vị trí tuyển dụng" : "Thêm vị trí tuyển dụng"}
          </h3>
          <p className="mt-1 text-sm text-[#9B6B50]">
            Các trường có dấu * là bắt buộc.
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="size-10 shrink-0 p-0"
          disabled={saving}
          aria-label="Đóng biểu mẫu"
          onClick={onCancel}
        >
          <X className="size-5" aria-hidden="true" />
        </Button>
      </div>

      {formError ? (
        <p
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700"
        >
          {formError}
        </p>
      ) : null}

      <div className="grid gap-5 md:grid-cols-2">
        <TextField
          id="job-title"
          label="Tên vị trí *"
          value={values.title}
          maxLength={150}
          error={errors.title}
          disabled={saving}
          placeholder="Ví dụ: Giáo viên IELTS"
          onChange={(value) => updateText("title", value)}
        />
        <div>
          <Label htmlFor="job-type" className="font-bold text-[#4A2306]">
            Loại hình làm việc *
          </Label>
          <select
            id="job-type"
            value={values.type}
            disabled={saving}
            required
            aria-invalid={Boolean(errors.type)}
            aria-describedby={errors.type ? "job-type-error" : undefined}
            className={`mt-2 h-12 w-full rounded-lg border border-border bg-white px-4 text-[#4A2306] outline-none transition-all focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-60 ${errors.type ? ERROR_INPUT_CLASS : ""}`}
            onChange={(event) => updateText("type", event.target.value)}
          >
            <option value="" disabled>
              Chọn loại hình làm việc
            </option>
            {EMPLOYMENT_TYPES.map((employmentType) => (
              <option key={employmentType.value} value={employmentType.value}>
                {employmentType.label}
              </option>
            ))}
          </select>
          {errors.type ? (
            <p
              id="job-type-error"
              role="alert"
              className="mt-1 text-xs font-medium text-red-600"
            >
              {errors.type}
            </p>
          ) : null}
        </div>
        <TextField
          id="job-location"
          label="Địa điểm *"
          value={values.location}
          maxLength={120}
          error={errors.location}
          disabled={saving}
          placeholder="Ví dụ: Hà Nội"
          onChange={(value) => updateText("location", value)}
        />
        <div>
          <Label htmlFor="job-salary-type" className="font-bold text-[#4A2306]">
            Hình thức trả lương *
          </Label>
          <select
            id="job-salary-type"
            value={values.salaryType}
            disabled={saving}
            required
            aria-invalid={Boolean(errors.salaryType)}
            aria-describedby={
              errors.salaryType ? "job-salary-type-error" : undefined
            }
            className={`mt-2 h-12 w-full rounded-lg border border-border bg-white px-4 text-[#4A2306] outline-none transition-all focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-60 ${errors.salaryType ? ERROR_INPUT_CLASS : ""}`}
            onChange={(event) =>
              updateSalaryType(event.target.value as SalaryType)
            }
          >
            <option value="" disabled>
              Chọn hình thức trả lương
            </option>
            <option value="RANGE">Theo khoảng lương</option>
            <option value="FIXED">Mức lương cố định</option>
            <option value="NEGOTIABLE">Thỏa thuận</option>
          </select>
          {errors.salaryType ? (
            <p
              id="job-salary-type-error"
              role="alert"
              className="mt-1 text-xs font-medium text-red-600"
            >
              {errors.salaryType}
            </p>
          ) : null}
        </div>
      </div>

      {values.salaryType === "RANGE" || values.salaryType === "FIXED" ? (
        <fieldset className="rounded-xl border border-border bg-[#FFF9F5]/60 p-4">
          <legend className="px-1 font-bold text-[#4A2306]">
            Chi tiết mức lương
          </legend>
          <div
            className={`grid gap-5 ${
              values.salaryType === "RANGE"
                ? "md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_10rem]"
                : "md:grid-cols-[minmax(0,1fr)_10rem]"
            }`}
          >
            <TextField
              id="job-salary-min"
              label={
                values.salaryType === "RANGE"
                  ? "Lương tối thiểu *"
                  : "Mức lương cố định *"
              }
              value={values.salaryMin}
              type="number"
              min={1}
              max={1000000000}
              error={errors.salaryMin}
              disabled={saving}
              placeholder="Ví dụ: 15000000"
              onChange={(value) => updateText("salaryMin", value)}
            />
            {values.salaryType === "RANGE" ? (
              <TextField
                id="job-salary-max"
                label="Lương tối đa *"
                value={values.salaryMax}
                type="number"
                min={1}
                max={1000000000}
                error={errors.salaryMax}
                disabled={saving}
                placeholder="Ví dụ: 30000000"
                onChange={(value) => updateText("salaryMax", value)}
              />
            ) : null}
            <div>
              <Label htmlFor="job-salary-currency" className="font-bold text-[#4A2306]">
                Đơn vị *
              </Label>
              <select
                id="job-salary-currency"
                value={values.currency}
                disabled={saving}
                aria-invalid={Boolean(errors.currency)}
                className={`mt-2 h-12 w-full rounded-lg border border-border bg-white px-4 text-[#4A2306] outline-none transition-all focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-60 ${errors.currency ? ERROR_INPUT_CLASS : ""}`}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    currency: event.target.value as "VND",
                  }))
                }
              >
                <option value="VND">VND</option>
              </select>
            </div>
          </div>
        </fieldset>
      ) : null}

      <div>
        <Label htmlFor="job-requirements" className="font-bold text-[#4A2306]">
          Yêu cầu ứng viên *
        </Label>
        <Textarea
          id="job-requirements"
          value={values.req}
          maxLength={2000}
          disabled={saving}
          aria-invalid={Boolean(errors.req)}
          aria-describedby={errors.req ? "job-requirements-error" : undefined}
          className={`mt-2 min-h-32 resize-y bg-white ${errors.req ? ERROR_INPUT_CLASS : ""}`}
          placeholder="Mô tả kinh nghiệm, chuyên môn và kỹ năng cần có..."
          onChange={(event) => updateText("req", event.target.value)}
        />
        {errors.req ? (
          <p id="job-requirements-error" className="mt-1 text-xs font-medium text-red-600">
            {errors.req}
          </p>
        ) : null}
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        {renderItemList("duties", "Nhiệm vụ", "Thêm nhiệm vụ")}
        {renderItemList("benefits", "Quyền lợi", "Thêm quyền lợi")}
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <TextField
          id="job-sort-order"
          label="Thứ tự hiển thị"
          value={values.sortOrder}
          type="number"
          min={1}
          max={10000}
          error={errors.sortOrder}
          disabled={saving}
          helper="Bắt đầu từ 1; số nhỏ hơn sẽ được hiển thị trước."
          onChange={(value) => updateText("sortOrder", value)}
        />

        <fieldset className="min-w-0 self-start">
          <legend className="font-bold text-[#4A2306]">
            Trạng thái vị trí
          </legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            <label className="flex h-12 cursor-pointer items-center gap-3 rounded-lg border border-border bg-white px-4 transition-colors hover:bg-[#FFF9F5] has-[:checked]:border-primary has-[:checked]:bg-secondary/60 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary/30 has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60">
              <input
                type="radio"
                name="job-published-status"
                value="published"
                checked={values.isPublished}
                disabled={saving}
                className="size-4 shrink-0 accent-primary"
                onChange={() =>
                  setValues((current) => ({
                    ...current,
                    isPublished: true,
                  }))
                }
              />
              <span className="font-bold text-[#4A2306]">Công khai</span>
            </label>
            <label className="flex h-12 cursor-pointer items-center gap-3 rounded-lg border border-border bg-white px-4 transition-colors hover:bg-[#FFF9F5] has-[:checked]:border-primary has-[:checked]:bg-secondary/60 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary/30 has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60">
              <input
                type="radio"
                name="job-published-status"
                value="draft"
                checked={!values.isPublished}
                disabled={saving}
                className="size-4 shrink-0 accent-primary"
                onChange={() =>
                  setValues((current) => ({
                    ...current,
                    isPublished: false,
                  }))
                }
              />
              <span className="font-bold text-[#4A2306]">Ẩn</span>
            </label>
          </div>
        </fieldset>
      </div>

      <div className="flex flex-col-reverse gap-2 border-t border-border pt-5 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          disabled={saving}
          onClick={onCancel}
        >
          Huỷ
        </Button>
        <Button type="submit" disabled={saving}>
          <Save className="size-4" aria-hidden="true" />
          {saving ? "Đang lưu..." : job ? "Lưu thay đổi" : "Tạo vị trí"}
        </Button>
      </div>
    </form>
  );
}

type TextFieldProps = {
  id: string;
  label: string;
  value: string;
  type?: "text" | "number";
  maxLength?: number;
  min?: number;
  max?: number;
  error?: string;
  helper?: string;
  placeholder?: string;
  disabled: boolean;
  onChange: (value: string) => void;
};

function TextField({
  id,
  label,
  value,
  type = "text",
  maxLength,
  min,
  max,
  error,
  helper,
  placeholder,
  disabled,
  onChange,
}: TextFieldProps) {
  const errorId = `${id}-error`;
  const helperId = `${id}-helper`;
  return (
    <div>
      <Label htmlFor={id} className="font-bold text-[#4A2306]">
        {label}
      </Label>
      <Input
        id={id}
        type={type}
        value={value}
        maxLength={maxLength}
        min={min}
        max={max}
        disabled={disabled}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : helper ? helperId : undefined}
        className={`mt-2 bg-white ${error ? ERROR_INPUT_CLASS : ""}`}
        onChange={(event) => onChange(event.target.value)}
      />
      {error ? (
        <p id={errorId} className="mt-1 text-xs font-medium text-red-600">
          {error}
        </p>
      ) : helper ? (
        <p id={helperId} className="mt-1 text-xs text-[#9B6B50]">
          {helper}
        </p>
      ) : null}
    </div>
  );
}
