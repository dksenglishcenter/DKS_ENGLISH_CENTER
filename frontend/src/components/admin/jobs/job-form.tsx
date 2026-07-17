"use client";

import { useRef, useState } from "react";
import { BriefcaseBusiness, Plus, Save, Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createJob, updateJob } from "@/lib/jobs/api";
import type { Job, JobFormValues } from "@/lib/jobs/types";
import {
  hasJobFormErrors,
  normalizeJobPayload,
  type JobFormErrors,
  validateJobForm,
} from "@/lib/jobs/validation";
import { formatError } from "@/lib/errors/format-error";

const ERROR_INPUT_CLASS =
  "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-200";

function createInitialValues(job: Job | null, sortOrder: number): JobFormValues {
  if (job) {
    return {
      title: job.title,
      type: job.type,
      location: job.location,
      salary: job.salary,
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
    salary: "",
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
    field: "title" | "type" | "location" | "salary" | "req" | "sortOrder",
    value: string,
  ) {
    setValues((current) => ({ ...current, [field]: value }));
    clearError(field);
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
      const payload = normalizeJobPayload(values);
      const response = job
        ? await updateJob(job.id, payload)
        : await createJob(payload);
      onSaved(response.message);
    } catch (error) {
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
        <TextField
          id="job-type"
          label="Loại hình làm việc *"
          value={values.type}
          maxLength={80}
          error={errors.type}
          disabled={saving}
          placeholder="Ví dụ: Full-time"
          onChange={(value) => updateText("type", value)}
        />
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
        <TextField
          id="job-salary"
          label="Mức lương *"
          value={values.salary}
          maxLength={120}
          error={errors.salary}
          disabled={saving}
          placeholder="Ví dụ: Thỏa thuận"
          onChange={(value) => updateText("salary", value)}
        />
      </div>

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
          min={0}
          max={10000}
          error={errors.sortOrder}
          disabled={saving}
          helper="Số nhỏ hơn sẽ được hiển thị trước."
          onChange={(value) => updateText("sortOrder", value)}
        />

        <label className="flex min-h-12 cursor-pointer items-center justify-between gap-4 self-start rounded-xl border border-border bg-white px-4 py-2 transition-colors hover:border-primary/50 has-[:focus-visible]:border-primary has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60 md:mt-[34px]">
          <span className="font-bold text-[#4A2306]">Công khai vị trí</span>
          <input
            type="checkbox"
            checked={values.isPublished}
            disabled={saving}
            className="peer sr-only"
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                isPublished: event.target.checked,
              }))
            }
          />
          <span
            aria-hidden="true"
            className="relative h-7 w-12 shrink-0 rounded-full bg-[#D8C4B8] transition-colors after:absolute after:left-1 after:top-1 after:size-5 after:rounded-full after:bg-white after:shadow-sm after:transition-transform peer-checked:bg-primary peer-checked:after:translate-x-5"
          />
        </label>
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
