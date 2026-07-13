"use client";

import { useState } from "react";
import { LoaderCircle, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitContactForm } from "@/lib/contact/api";
import {
  CONTACT_COURSE_OPTIONS,
  type ContactCourseOption,
  type ContactFormPayload,
} from "@/lib/contact/types";
import { ApiError } from "@/lib/errors/format-error";
import {
  getPhoneValidationError,
  normalizePhone,
  PHONE_LIMITS,
  sanitizePhoneInput,
} from "@/lib/validation/phone";

type SubmissionStatus =
  | { type: "idle"; message: "" }
  | { type: "success" | "error"; message: string };

const INITIAL_STATUS: SubmissionStatus = { type: "idle", message: "" };

const FORM_LIMITS = {
  fullName: { min: 2, max: 100 },
  email: 255,
  learningNeeds: { min: 10, max: 2000 },
} as const;

type ContactFormValues = {
  fullName: string;
  phone: string;
  email: string;
  courseInterest: string;
  learningNeeds: string;
};

type ContactField = keyof ContactFormValues;
type FieldErrors = Partial<Record<ContactField, string>>;

const INITIAL_FORM_VALUES: ContactFormValues = {
  fullName: "",
  phone: "",
  email: "",
  courseInterest: "",
  learningNeeds: "",
};

const CONTACT_FIELDS: ContactField[] = [
  "fullName",
  "phone",
  "email",
  "courseInterest",
  "learningNeeds",
];

const NAME_PATTERN = /^[\p{L}\p{M}][\p{L}\p{M}\s.'’-]*$/u;
const EMAIL_PATTERN = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;

function containsHtmlCharacters(value: string) {
  return /[<>]/.test(value);
}

function isContactCourseOption(value: string): value is ContactCourseOption {
  return CONTACT_COURSE_OPTIONS.some((option) => option === value);
}

function getFieldError(field: ContactField, rawValue: string): string | undefined {
  const value = rawValue.trim();

  if (field === "fullName") {
    if (!value) return "Vui lòng nhập họ và tên.";
    if (containsHtmlCharacters(value)) return "Họ và tên không được chứa thẻ HTML.";
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

  if (field === "phone") {
    return getPhoneValidationError(value);
  }

  if (field === "email" && value) {
    if (containsHtmlCharacters(value)) return "Email không được chứa thẻ HTML.";
    if (value.length > FORM_LIMITS.email) {
      return `Email không được vượt quá ${FORM_LIMITS.email} ký tự.`;
    }
    if (!EMAIL_PATTERN.test(value)) return "Vui lòng nhập đúng định dạng email.";
  }

  if (field === "courseInterest" && !isContactCourseOption(value)) {
    return "Vui lòng chọn một khóa học hợp lệ.";
  }

  if (field === "learningNeeds" && value) {
    if (containsHtmlCharacters(value)) {
      return "Nhu cầu học tập không được chứa thẻ HTML.";
    }
    if (value.length < FORM_LIMITS.learningNeeds.min) {
      return `Nhu cầu học tập phải có ít nhất ${FORM_LIMITS.learningNeeds.min} ký tự nếu được nhập.`;
    }
    if (value.length > FORM_LIMITS.learningNeeds.max) {
      return `Nhu cầu học tập không được vượt quá ${FORM_LIMITS.learningNeeds.max.toLocaleString("vi-VN")} ký tự.`;
    }
  }

  return undefined;
}

function validateForm(values: ContactFormValues) {
  return CONTACT_FIELDS.reduce<FieldErrors>((errors, field) => {
    const error = getFieldError(field, values[field]);
    if (error) errors[field] = error;
    return errors;
  }, {});
}

function normalizeFormValues(values: ContactFormValues): ContactFormValues {
  return {
    fullName: values.fullName.trim().replace(/\s+/g, " "),
    phone: normalizePhone(values.phone),
    email: values.email.trim().toLowerCase(),
    courseInterest: values.courseInterest,
    learningNeeds: values.learningNeeds.trim(),
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

export function ContactForm() {
  const [values, setValues] = useState<ContactFormValues>(INITIAL_FORM_VALUES);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] =
    useState<SubmissionStatus>(INITIAL_STATUS);

  function updateField(field: ContactField, value: string) {
    const nextValue = field === "phone" ? sanitizePhoneInput(value) : value;
    setValues((currentValues) => ({ ...currentValues, [field]: nextValue }));
    setSubmissionStatus(INITIAL_STATUS);

    if (fieldErrors[field]) {
      setFieldErrors((currentErrors) => {
        const nextErrors = { ...currentErrors };
        delete nextErrors[field];
        return nextErrors;
      });
    }
  }

  function validateField(field: ContactField) {
    setFieldErrors((currentErrors) => ({
      ...currentErrors,
      [field]: getFieldError(field, values[field]),
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    const form = event.currentTarget;
    const normalizedValues = normalizeFormValues(values);
    const errors = validateForm(normalizedValues);
    const firstInvalidField = CONTACT_FIELDS.find((field) => errors[field]);

    setValues(normalizedValues);
    setFieldErrors(errors);
    setSubmissionStatus(INITIAL_STATUS);

    if (firstInvalidField) {
      const firstInvalidControl = form.elements.namedItem(firstInvalidField);
      if (firstInvalidControl instanceof HTMLElement) firstInvalidControl.focus();
      return;
    }

    if (!isContactCourseOption(normalizedValues.courseInterest)) return;

    const payload: ContactFormPayload = {
      fullName: normalizedValues.fullName,
      phone: normalizedValues.phone,
      courseInterest: normalizedValues.courseInterest,
      ...(normalizedValues.email ? { email: normalizedValues.email } : {}),
      ...(normalizedValues.learningNeeds
        ? { learningNeeds: normalizedValues.learningNeeds }
        : {}),
    };

    setIsSubmitting(true);
    setSubmissionStatus(INITIAL_STATUS);

    try {
      const response = await submitContactForm(payload);
      setValues(INITIAL_FORM_VALUES);
      setFieldErrors({});
      setSubmissionStatus({ type: "success", message: response.message });
    } catch (error) {
      setSubmissionStatus({ type: "error", message: getSubmissionErrorMessage(error) });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="space-y-5"
      aria-busy={isSubmitting}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="contact-name">
            Họ và tên <span className="ml-0.5 text-primary">*</span>
          </Label>
          <Input
            id="contact-name"
            name="fullName"
            autoComplete="name"
            placeholder="Nguyễn Văn A"
            value={values.fullName}
            onChange={(event) => updateField("fullName", event.target.value)}
            onBlur={() => validateField("fullName")}
            minLength={FORM_LIMITS.fullName.min}
            maxLength={FORM_LIMITS.fullName.max}
            className={fieldErrors.fullName ? "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-200" : undefined}
            aria-invalid={Boolean(fieldErrors.fullName)}
            aria-describedby={fieldErrors.fullName ? "contact-name-error" : undefined}
            required
          />
          <FieldError id="contact-name-error" error={fieldErrors.fullName} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="contact-phone">
            Số điện thoại <span className="ml-0.5 text-primary">*</span>
          </Label>
          <Input
            id="contact-phone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="0901234567 hoặc +84901234567"
            value={values.phone}
            onChange={(event) => updateField("phone", event.target.value)}
            onBlur={() => validateField("phone")}
            maxLength={PHONE_LIMITS.maxDigits + 1}
            className={fieldErrors.phone ? "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-200" : undefined}
            aria-invalid={Boolean(fieldErrors.phone)}
            aria-describedby={fieldErrors.phone ? "contact-phone-error" : undefined}
            required
          />
          <FieldError id="contact-phone-error" error={fieldErrors.phone} />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="contact-email">Email</Label>
        <Input
          id="contact-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="email@example.com"
          value={values.email}
          onChange={(event) => updateField("email", event.target.value)}
          onBlur={() => validateField("email")}
          maxLength={FORM_LIMITS.email}
          className={fieldErrors.email ? "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-200" : undefined}
          aria-invalid={Boolean(fieldErrors.email)}
          aria-describedby={fieldErrors.email ? "contact-email-error" : undefined}
        />
        <FieldError id="contact-email-error" error={fieldErrors.email} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="contact-course">
          Khóa học quan tâm <span className="ml-0.5 text-primary">*</span>
        </Label>
        <select
          id="contact-course"
          name="courseInterest"
          value={values.courseInterest}
          onChange={(event) => updateField("courseInterest", event.target.value)}
          onBlur={() => validateField("courseInterest")}
          aria-invalid={Boolean(fieldErrors.courseInterest)}
          aria-describedby={fieldErrors.courseInterest ? "contact-course-error" : undefined}
          required
          className={`h-12 w-full cursor-pointer rounded-lg border bg-[#FFF9F5] px-4 py-3 text-[#4A2306] outline-none transition-all focus-visible:ring-2 font-[family-name:var(--font-body)] ${
            fieldErrors.courseInterest
              ? "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-200"
              : "border-border focus-visible:border-primary focus-visible:ring-primary"
          }`}
        >
          <option value="" disabled>
            -- Chọn khóa học quan tâm --
          </option>
          {CONTACT_COURSE_OPTIONS.map((course) => (
            <option key={course} value={course}>
              {course}
            </option>
          ))}
        </select>
        <FieldError id="contact-course-error" error={fieldErrors.courseInterest} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="contact-message">Nhu cầu học tập (không bắt buộc)</Label>
        <Textarea
          id="contact-message"
          name="learningNeeds"
          rows={4}
          placeholder="Chia sẻ nhu cầu hoặc câu hỏi của bạn với chúng tôi..."
          value={values.learningNeeds}
          onChange={(event) => updateField("learningNeeds", event.target.value)}
          onBlur={() => validateField("learningNeeds")}
          minLength={FORM_LIMITS.learningNeeds.min}
          maxLength={FORM_LIMITS.learningNeeds.max}
          className={fieldErrors.learningNeeds ? "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-200" : undefined}
          aria-invalid={Boolean(fieldErrors.learningNeeds)}
          aria-describedby={fieldErrors.learningNeeds ? "contact-message-error" : undefined}
        />
        <FieldError id="contact-message-error" error={fieldErrors.learningNeeds} />
      </div>

      {submissionStatus.type !== "idle" ? (
        <p
          role={submissionStatus.type === "error" ? "alert" : "status"}
          aria-live="polite"
          className={
            submissionStatus.type === "error"
              ? "rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-relaxed text-red-800"
              : "rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm leading-relaxed text-[#4A2306]"
          }
        >
          {submissionStatus.message}
        </p>
      ) : null}

      <Button
        type="submit"
        className="min-h-12 w-full justify-center"
        size="lg"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <LoaderCircle className="h-5 w-5 animate-spin" aria-hidden="true" />
        ) : (
          <Send className="h-5 w-5" aria-hidden="true" />
        )}
        {isSubmitting ? "Đang gửi..." : "Đăng ký ngay – Miễn phí!"}
      </Button>
    </form>
  );
}
