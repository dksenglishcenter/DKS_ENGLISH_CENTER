"use client";

import { useState } from "react";
import { LoaderCircle, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitCareerApplication } from "@/lib/careers/api";
import type { CareerApplicationPayload } from "@/lib/careers/types";
import { ApiError } from "@/lib/errors/format-error";
import {
  getPhoneValidationError,
  normalizePhone,
  PHONE_LIMITS,
  sanitizePhoneInput,
} from "@/lib/validation/phone";
import { cn } from "@/components/ui/utils";

const FORM_LIMITS = {
  fullName: { min: 4, max: 100 },
  email: 255,
  introduction: { min: 10, max: 2000 },
} as const;

type CareerFormValues = {
  fullName: string;
  email: string;
  phone: string;
  jobId: string;
  introduction: string;
};

type CareerField = keyof CareerFormValues;
type FieldErrors = Partial<Record<CareerField, string>>;

const INITIAL_FORM_VALUES: CareerFormValues = {
  fullName: "",
  email: "",
  phone: "",
  jobId: "",
  introduction: "",
};

const CAREER_FIELDS: CareerField[] = [
  "fullName",
  "email",
  "phone",
  "jobId",
  "introduction",
];

const NAME_PATTERN = /^[\p{L}\p{M}][\p{L}\p{M}\s.'’-]*$/u;
const EMAIL_PATTERN = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;

function containsHtmlCharacters(value: string) {
  return /[<>]/.test(value);
}

type CareerPosition = {
  id: string;
  title: string;
};

function isCareerPosition(value: string, positions: readonly CareerPosition[]) {
  return positions.some((position) => position.id === value);
}

function getFieldError(
  field: CareerField,
  rawValue: string,
  positions: readonly CareerPosition[],
): string | undefined {
  const value = rawValue.trim();

  if (field === "fullName") {
    if (!value) return "Vui lòng nhập họ và tên.";
    if (containsHtmlCharacters(value))
      return "Họ và tên không được chứa thẻ HTML.";
    if (!/\s/.test(value)) {
      return "Vui lòng nhập đầy đủ họ và tên (ví dụ: Nguyễn Văn A).";
    }
    if (value.length < FORM_LIMITS.fullName.min) {
      return `Họ và tên phải có ít nhất ${FORM_LIMITS.fullName.min} ký tự.`;
    }
    if (value.length > FORM_LIMITS.fullName.max) {
      return `Họ và tên không được vượt quá ${FORM_LIMITS.fullName.max} ký tự.`;
    }
    if (!NAME_PATTERN.test(value)) {
      return "Họ và tên chỉ được chứa chữ cái, khoảng trắng, dấu chấm, dấu nháy hoặc dấu gạch nối.";
    }
  }

  if (field === "email") {
    if (!value) return "Vui lòng nhập email.";
    if (containsHtmlCharacters(value)) return "Email không được chứa thẻ HTML.";
    if (value.length > FORM_LIMITS.email) {
      return `Email không được vượt quá ${FORM_LIMITS.email} ký tự.`;
    }
    if (!EMAIL_PATTERN.test(value))
      return "Vui lòng nhập đúng định dạng email.";
  }

  if (field === "phone") {
    return getPhoneValidationError(value);
  }

  if (field === "jobId" && !isCareerPosition(value, positions)) {
    return "Vui lòng chọn một vị trí ứng tuyển hợp lệ.";
  }

  if (field === "introduction" && value) {
    if (containsHtmlCharacters(value)) {
      return "Giới thiệu bản thân không được chứa thẻ HTML.";
    }
    if (value.length < FORM_LIMITS.introduction.min) {
      return `Giới thiệu bản thân phải có ít nhất ${FORM_LIMITS.introduction.min} ký tự nếu được nhập.`;
    }
    if (value.length > FORM_LIMITS.introduction.max) {
      return `Giới thiệu bản thân không được vượt quá ${FORM_LIMITS.introduction.max.toLocaleString("vi-VN")} ký tự.`;
    }
  }

  return undefined;
}

function validateForm(
  values: CareerFormValues,
  positions: readonly CareerPosition[],
) {
  return CAREER_FIELDS.reduce<FieldErrors>((errors, field) => {
    const error = getFieldError(field, values[field], positions);
    if (error) errors[field] = error;
    return errors;
  }, {});
}

function normalizeFormValues(values: CareerFormValues): CareerFormValues {
  return {
    fullName: values.fullName.trim().replace(/\s+/g, " "),
    email: values.email.trim().toLowerCase(),
    phone: normalizePhone(values.phone),
    jobId: values.jobId,
    introduction: values.introduction.trim(),
  };
}

function getSubmissionErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status >= 400 && error.status < 500) {
      return "Thông tin gửi lên chưa hợp lệ. Vui lòng kiểm tra lại các trường.";
    }
    return "Hệ thống đang bận. Vui lòng thử lại sau.";
  }

  return "Không thể kết nối tới hệ thống. Vui lòng kiểm tra mạng và thử lại.";
}

function FieldError({ id, error }: { id: string; error?: string }) {
  if (!error) return null;

  return (
    <p id={id} role="alert" className="text-xs leading-relaxed text-red-700">
      {error}
    </p>
  );
}

function fieldInputClass(hasError: boolean) {
  return hasError
    ? "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-200"
    : undefined;
}

type CareerApplicationFormProps = {
  initialJobId?: string;
  positions: CareerPosition[];
  onSuccess?: (message: string) => void;
};

export function CareerApplicationForm({
  initialJobId = "",
  positions,
  onSuccess,
}: CareerApplicationFormProps) {
  const [values, setValues] = useState<CareerFormValues>({
    ...INITIAL_FORM_VALUES,
    jobId: initialJobId,
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState("");

  function updateField(field: CareerField, value: string) {
    const nextValue = field === "phone" ? sanitizePhoneInput(value) : value;
    setValues((current) => ({ ...current, [field]: nextValue }));
    setSubmissionError("");

    if (fieldErrors[field]) {
      setFieldErrors((current) => {
        const next = { ...current };
        delete next[field];
        return next;
      });
    }
  }

  function validateField(field: CareerField) {
    setFieldErrors((current) => ({
      ...current,
      [field]: getFieldError(field, values[field], positions),
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    const form = event.currentTarget;
    const normalizedValues = normalizeFormValues(values);
    const errors = validateForm(normalizedValues, positions);
    const firstInvalidField = CAREER_FIELDS.find((field) => errors[field]);

    setValues(normalizedValues);
    setFieldErrors(errors);
    setSubmissionError("");

    if (firstInvalidField) {
      const firstInvalidControl = form.elements.namedItem(firstInvalidField);
      if (firstInvalidControl instanceof HTMLElement)
        firstInvalidControl.focus();
      return;
    }

    if (!isCareerPosition(normalizedValues.jobId, positions)) return;

    const payload: CareerApplicationPayload = {
      jobId: normalizedValues.jobId,
      fullName: normalizedValues.fullName,
      email: normalizedValues.email,
      phone: normalizedValues.phone,
      ...(normalizedValues.introduction
        ? { introduction: normalizedValues.introduction }
        : {}),
    };

    setIsSubmitting(true);

    try {
      const response = await submitCareerApplication(payload);
      setValues({ ...INITIAL_FORM_VALUES, jobId: initialJobId });
      setFieldErrors({});
      onSuccess?.(response.message);
    } catch (error) {
      setSubmissionError(getSubmissionErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4"
      noValidate
      aria-busy={isSubmitting}
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="career-name">
          Họ và tên <span className="ml-0.5 text-primary">*</span>
        </Label>
        <Input
          id="career-name"
          name="fullName"
          autoComplete="name"
          placeholder="Nguyễn Văn A"
          value={values.fullName}
          onChange={(event) => updateField("fullName", event.target.value)}
          onBlur={() => validateField("fullName")}
          minLength={FORM_LIMITS.fullName.min}
          maxLength={FORM_LIMITS.fullName.max}
          className={fieldInputClass(Boolean(fieldErrors.fullName))}
          aria-invalid={Boolean(fieldErrors.fullName)}
          aria-describedby={
            fieldErrors.fullName ? "career-name-error" : undefined
          }
          required
        />
        <FieldError id="career-name-error" error={fieldErrors.fullName} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="career-email">
          Email <span className="ml-0.5 text-primary">*</span>
        </Label>
        <Input
          id="career-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="email@example.com"
          value={values.email}
          onChange={(event) => updateField("email", event.target.value)}
          onBlur={() => validateField("email")}
          maxLength={FORM_LIMITS.email}
          className={fieldInputClass(Boolean(fieldErrors.email))}
          aria-invalid={Boolean(fieldErrors.email)}
          aria-describedby={
            fieldErrors.email ? "career-email-error" : undefined
          }
          required
        />
        <FieldError id="career-email-error" error={fieldErrors.email} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="career-phone">
          Số điện thoại <span className="ml-0.5 text-primary">*</span>
        </Label>
        <Input
          id="career-phone"
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="0901234567 hoặc +84901234567"
          value={values.phone}
          onChange={(event) => updateField("phone", event.target.value)}
          onBlur={() => validateField("phone")}
          maxLength={PHONE_LIMITS.maxDigits + 1}
          className={fieldInputClass(Boolean(fieldErrors.phone))}
          aria-invalid={Boolean(fieldErrors.phone)}
          aria-describedby={
            fieldErrors.phone ? "career-phone-error" : undefined
          }
          required
        />
        <FieldError id="career-phone-error" error={fieldErrors.phone} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="career-position">
          Vị trí ứng tuyển <span className="ml-0.5 text-primary">*</span>
        </Label>
        <select
          id="career-position"
          name="jobId"
          value={values.jobId}
          onChange={(event) => updateField("jobId", event.target.value)}
          onBlur={() => validateField("jobId")}
          aria-invalid={Boolean(fieldErrors.jobId)}
          aria-describedby={
            fieldErrors.jobId ? "career-position-error" : undefined
          }
          required
          className={cn(
            "h-12 w-full cursor-pointer rounded-lg border bg-input-background px-4 py-3 font-[family-name:var(--font-body)] text-foreground outline-none transition-all focus-visible:ring-2",
            fieldErrors.jobId
              ? "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-200"
              : "border-border focus-visible:border-primary focus-visible:ring-primary",
          )}
        >
          <option value="" disabled>
            -- Chọn vị trí ứng tuyển --
          </option>
          {positions.map((position) => (
            <option key={position.id} value={position.id}>
              {position.title}
            </option>
          ))}
        </select>
        <FieldError id="career-position-error" error={fieldErrors.jobId} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="career-introduction">Giới thiệu bản thân</Label>
        <Textarea
          id="career-introduction"
          name="introduction"
          rows={4}
          placeholder="Chia sẻ về kinh nghiệm và lý do bạn muốn gia nhập DKS..."
          value={values.introduction}
          onChange={(event) => updateField("introduction", event.target.value)}
          onBlur={() => validateField("introduction")}
          minLength={FORM_LIMITS.introduction.min}
          maxLength={FORM_LIMITS.introduction.max}
          className={fieldInputClass(Boolean(fieldErrors.introduction))}
          aria-invalid={Boolean(fieldErrors.introduction)}
          aria-describedby={
            fieldErrors.introduction ? "career-introduction-error" : undefined
          }
        />
        <FieldError
          id="career-introduction-error"
          error={fieldErrors.introduction}
        />
      </div>

      {submissionError ? (
        <p
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {submissionError}
        </p>
      ) : null}

      <Button
        type="submit"
        className="w-full justify-center"
        size="md"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          <Send className="h-4 w-4" aria-hidden="true" />
        )}
        {isSubmitting ? "Đang gửi..." : "Gửi đơn ứng tuyển"}
      </Button>
    </form>
  );
}
