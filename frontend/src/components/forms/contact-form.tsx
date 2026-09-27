"use client";

import { useState } from "react";
import { LoaderCircle, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitContactForm } from "@/lib/contact/api";
import {
  getWhatsAppHref,
  getZaloChatHrefFromPhone,
} from "@/lib/contact/messaging-links";
import {
  CONTACT_CHANNELS,
  CONTACT_OTHER_COURSE,
  CONTACT_SENDER_ROLES,
  type ContactChannel,
  type ContactSenderRole,
} from "@/lib/contact/options";
import type { ContactFormPayload } from "@/lib/contact/types";
import {
  getEmailValidationError,
  getNameValidationError,
  containsHtmlCharacters,
} from "@/lib/validation/person";
import { getPublicFormSubmissionError } from "@/lib/validation/form-submit";
import {
  getPhoneValidationError,
  normalizePhone,
  PHONE_LIMITS,
  sanitizePhoneInput,
} from "@/lib/validation/phone";
import { cn } from "@/components/ui/utils";

type SubmissionStatus =
  | { type: "idle"; message: "" }
  | { type: "success" | "error"; message: string };

const INITIAL_STATUS: SubmissionStatus = { type: "idle", message: "" };

const FORM_LIMITS = {
  fullName: { min: 2, max: 100 },
  email: 255,
  learningNeeds: { min: 10, max: 2000 },
  courseInterestOther: { min: 2, max: 200 },
} as const;

type ContactFormValues = {
  fullName: string;
  phone: string;
  email: string;
  senderRole: string;
  contactChannel: string;
  courseInterest: string;
  courseInterestOther: string;
  learningNeeds: string;
};

type ContactField = keyof ContactFormValues;
type FieldErrors = Partial<Record<ContactField, string>>;

const INITIAL_FORM_VALUES: ContactFormValues = {
  fullName: "",
  phone: "",
  email: "",
  senderRole: "",
  contactChannel: "zalo",
  courseInterest: "",
  courseInterestOther: "",
  learningNeeds: "",
};

const CONTACT_FIELDS: ContactField[] = [
  "fullName",
  "phone",
  "email",
  "senderRole",
  "contactChannel",
  "courseInterest",
  "courseInterestOther",
  "learningNeeds",
];

const selectClassName = (hasError: boolean) =>
  cn(
    "h-12 w-full cursor-pointer rounded-lg border bg-input-background px-4 py-3 text-foreground outline-none transition-all focus-visible:ring-2 font-[family-name:var(--font-body)]",
    hasError
      ? "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-200"
      : "border-border focus-visible:border-primary focus-visible:ring-primary",
  );

function isContactCourseOption(value: string, courseOptions: string[]) {
  return value === CONTACT_OTHER_COURSE || courseOptions.includes(value);
}

function isSenderRole(value: string): value is ContactSenderRole {
  return CONTACT_SENDER_ROLES.some((item) => item.value === value);
}

function isChannel(value: string): value is ContactChannel {
  return CONTACT_CHANNELS.some((item) => item.value === value);
}

function getFieldError(
  field: ContactField,
  values: ContactFormValues,
  courseOptions: string[],
): string | undefined {
  const value = values[field].trim();

  if (field === "fullName") {
    return getNameValidationError(value, {
      min: FORM_LIMITS.fullName.min,
      max: FORM_LIMITS.fullName.max,
    });
  }

  if (field === "phone") {
    return getPhoneValidationError(value);
  }

  if (field === "email" && value) {
    return getEmailValidationError(value, { max: FORM_LIMITS.email });
  }

  if (field === "senderRole") {
    if (!isSenderRole(value)) return "Vui lòng chọn bạn đang là ai.";
    return undefined;
  }

  if (field === "contactChannel") {
    if (!isChannel(value)) return "Vui lòng chọn kênh liên hệ.";
    return undefined;
  }

  if (field === "courseInterest") {
    if (!isContactCourseOption(value, courseOptions)) {
      return "Vui lòng chọn một khóa học hợp lệ.";
    }
    return undefined;
  }

  if (field === "courseInterestOther") {
    if (values.courseInterest !== CONTACT_OTHER_COURSE) return undefined;
    if (!value) return "Vui lòng mô tả khóa học quan tâm.";
    if (value.length < FORM_LIMITS.courseInterestOther.min) {
      return `Nhập ít nhất ${FORM_LIMITS.courseInterestOther.min} ký tự.`;
    }
    if (value.length > FORM_LIMITS.courseInterestOther.max) {
      return `Tối đa ${FORM_LIMITS.courseInterestOther.max} ký tự.`;
    }
    return undefined;
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

function validateForm(values: ContactFormValues, courseOptions: string[]) {
  return CONTACT_FIELDS.reduce<FieldErrors>((errors, field) => {
    const error = getFieldError(field, values, courseOptions);
    if (error) errors[field] = error;
    return errors;
  }, {});
}

function normalizeFormValues(values: ContactFormValues): ContactFormValues {
  return {
    fullName: values.fullName.trim().replace(/\s+/g, " "),
    phone: normalizePhone(values.phone),
    email: values.email.trim().toLowerCase(),
    senderRole: values.senderRole,
    contactChannel: values.contactChannel,
    courseInterest: values.courseInterest,
    courseInterestOther: values.courseInterestOther.trim(),
    learningNeeds: values.learningNeeds.trim(),
  };
}

function FieldError({ id, error }: { id: string; error?: string }) {
  if (!error) return null;

  return (
    <p id={id} role="alert" className="text-xs leading-relaxed text-red-700">
      {error}
    </p>
  );
}

export function ContactForm({ courseOptions }: { courseOptions: string[] }) {
  const [values, setValues] = useState<ContactFormValues>(INITIAL_FORM_VALUES);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] =
    useState<SubmissionStatus>(INITIAL_STATUS);

  const phoneOk = !getPhoneValidationError(values.phone.trim());
  const zaloHref = phoneOk ? getZaloChatHrefFromPhone(values.phone) : null;
  const whatsappHref = phoneOk
    ? getWhatsAppHref(values.phone, "Xin chào DKS English Center")
    : null;

  function updateField(field: ContactField, value: string) {
    const nextValue = field === "phone" ? sanitizePhoneInput(value) : value;
    setValues((currentValues) => ({ ...currentValues, [field]: nextValue }));
    setSubmissionStatus(INITIAL_STATUS);

    if (fieldErrors[field]) {
      setFieldErrors((currentErrors) => {
        const nextErrors = { ...currentErrors };
        delete nextErrors[field];
        if (field === "courseInterest") delete nextErrors.courseInterestOther;
        return nextErrors;
      });
    }
  }

  function validateField(field: ContactField) {
    setFieldErrors((currentErrors) => ({
      ...currentErrors,
      [field]: getFieldError(field, values, courseOptions),
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    const form = event.currentTarget;
    const normalizedValues = normalizeFormValues(values);
    const errors = validateForm(normalizedValues, courseOptions);
    const firstInvalidField = CONTACT_FIELDS.find((field) => errors[field]);

    setValues(normalizedValues);
    setFieldErrors(errors);
    setSubmissionStatus(INITIAL_STATUS);

    if (firstInvalidField) {
      const firstInvalidControl = form.elements.namedItem(firstInvalidField);
      if (firstInvalidControl instanceof HTMLElement) firstInvalidControl.focus();
      return;
    }

    if (
      !isSenderRole(normalizedValues.senderRole) ||
      !isChannel(normalizedValues.contactChannel) ||
      !isContactCourseOption(normalizedValues.courseInterest, courseOptions)
    ) {
      return;
    }

    const payload: ContactFormPayload = {
      fullName: normalizedValues.fullName,
      phone: normalizedValues.phone,
      senderRole: normalizedValues.senderRole,
      contactChannel: normalizedValues.contactChannel,
      courseInterest: normalizedValues.courseInterest,
      ...(normalizedValues.courseInterest === CONTACT_OTHER_COURSE
        ? { courseInterestOther: normalizedValues.courseInterestOther }
        : {}),
      ...(normalizedValues.email ? { email: normalizedValues.email } : {}),
      ...(normalizedValues.learningNeeds
        ? { learningNeeds: normalizedValues.learningNeeds }
        : {}),
    };

    setIsSubmitting(true);

    try {
      const response = await submitContactForm(payload);
      setValues(INITIAL_FORM_VALUES);
      setFieldErrors({});
      setSubmissionStatus({ type: "success", message: response.message });
    } catch (error) {
      setSubmissionStatus({
        type: "error",
        message: getPublicFormSubmissionError(error),
      });
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
            className={
              fieldErrors.fullName
                ? "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-200"
                : undefined
            }
            aria-invalid={Boolean(fieldErrors.fullName)}
            aria-describedby={
              fieldErrors.fullName ? "contact-name-error" : undefined
            }
            required
          />
          <FieldError id="contact-name-error" error={fieldErrors.fullName} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="contact-phone">
            Số điện thoại / Zalo / WhatsApp{" "}
            <span className="ml-0.5 text-primary">*</span>
          </Label>
          <Input
            id="contact-phone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="0901234567"
            value={values.phone}
            onChange={(event) => updateField("phone", event.target.value)}
            onBlur={() => validateField("phone")}
            maxLength={PHONE_LIMITS.maxDigits + 1}
            className={
              fieldErrors.phone
                ? "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-200"
                : undefined
            }
            aria-invalid={Boolean(fieldErrors.phone)}
            aria-describedby={
              fieldErrors.phone ? "contact-phone-error" : "contact-phone-hint"
            }
            required
          />
          <p id="contact-phone-hint" className="text-xs text-muted-foreground">
            Dùng số gắn Zalo/WhatsApp để trung tâm nhắn được ngay.
          </p>
          {zaloHref && whatsappHref ? (
            <div className="flex flex-wrap gap-2 pt-0.5">
              <a
                href={zaloHref}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-[#0068FF] underline-offset-2 hover:underline"
              >
                Mở Zalo với số này
              </a>
              <span className="text-xs text-muted-foreground" aria-hidden>
                ·
              </span>
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-[#128C7E] underline-offset-2 hover:underline"
              >
                Mở WhatsApp
              </a>
            </div>
          ) : null}
          <FieldError id="contact-phone-error" error={fieldErrors.phone} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="contact-channel">
            Liên hệ qua app <span className="ml-0.5 text-primary">*</span>
          </Label>
          <select
            id="contact-channel"
            name="contactChannel"
            value={values.contactChannel}
            onChange={(event) =>
              updateField("contactChannel", event.target.value)
            }
            onBlur={() => validateField("contactChannel")}
            aria-invalid={Boolean(fieldErrors.contactChannel)}
            className={selectClassName(Boolean(fieldErrors.contactChannel))}
            required
          >
            {CONTACT_CHANNELS.map((channel) => (
              <option key={channel.value} value={channel.value}>
                {channel.label}
              </option>
            ))}
          </select>
          <FieldError
            id="contact-channel-error"
            error={fieldErrors.contactChannel}
          />
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
            className={
              fieldErrors.email
                ? "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-200"
                : undefined
            }
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={
              fieldErrors.email ? "contact-email-error" : undefined
            }
          />
          <FieldError id="contact-email-error" error={fieldErrors.email} />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="contact-sender-role">
          Bạn là… <span className="ml-0.5 text-primary">*</span>
        </Label>
        <select
          id="contact-sender-role"
          name="senderRole"
          value={values.senderRole}
          onChange={(event) => updateField("senderRole", event.target.value)}
          onBlur={() => validateField("senderRole")}
          aria-invalid={Boolean(fieldErrors.senderRole)}
          aria-describedby={
            fieldErrors.senderRole
              ? "contact-sender-role-error"
              : "contact-sender-role-hint"
          }
          required
          className={selectClassName(Boolean(fieldErrors.senderRole))}
        >
          <option value="" disabled>
            Chọn vai trò của bạn
          </option>
          {CONTACT_SENDER_ROLES.map((role) => (
            <option key={role.value} value={role.value}>
              {role.label}
            </option>
          ))}
        </select>
        <p
          id="contact-sender-role-hint"
          className="text-xs text-muted-foreground"
        >
          Giúp DKS tư vấn đúng lộ trình và lịch học phù hợp.
        </p>
        <FieldError
          id="contact-sender-role-error"
          error={fieldErrors.senderRole}
        />
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
          aria-describedby={
            fieldErrors.courseInterest ? "contact-course-error" : undefined
          }
          required
          className={selectClassName(Boolean(fieldErrors.courseInterest))}
        >
          <option value="" disabled>
            {courseOptions.length > 0
              ? "Chọn khóa học quan tâm"
              : "Chọn “Khác” nếu chưa thấy khóa phù hợp"}
          </option>
          {courseOptions.map((course) => (
            <option key={course} value={course}>
              {course}
            </option>
          ))}
          <option value={CONTACT_OTHER_COURSE}>{CONTACT_OTHER_COURSE}</option>
        </select>
        <FieldError
          id="contact-course-error"
          error={fieldErrors.courseInterest}
        />
      </div>

      {values.courseInterest === CONTACT_OTHER_COURSE ? (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="contact-course-other">
            Mô tả khóa / mục tiêu <span className="ml-0.5 text-primary">*</span>
          </Label>
          <Input
            id="contact-course-other"
            name="courseInterestOther"
            placeholder="VD: Luyện thi IELTS 6.5, tiếng Anh giao tiếp..."
            value={values.courseInterestOther}
            onChange={(event) =>
              updateField("courseInterestOther", event.target.value)
            }
            onBlur={() => validateField("courseInterestOther")}
            maxLength={FORM_LIMITS.courseInterestOther.max}
            className={
              fieldErrors.courseInterestOther
                ? "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-200"
                : undefined
            }
            aria-invalid={Boolean(fieldErrors.courseInterestOther)}
            required
          />
          <FieldError
            id="contact-course-other-error"
            error={fieldErrors.courseInterestOther}
          />
        </div>
      ) : null}

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
          className={
            fieldErrors.learningNeeds
              ? "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-200"
              : undefined
          }
          aria-invalid={Boolean(fieldErrors.learningNeeds)}
          aria-describedby={
            fieldErrors.learningNeeds ? "contact-message-error" : undefined
          }
        />
        <FieldError
          id="contact-message-error"
          error={fieldErrors.learningNeeds}
        />
      </div>

      {submissionStatus.type !== "idle" ? (
        <p
          role={submissionStatus.type === "error" ? "alert" : "status"}
          aria-live="polite"
          className={
            submissionStatus.type === "error"
              ? "rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
              : "rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800"
          }
        >
          {submissionStatus.message}
        </p>
      ) : null}

      <Button type="submit" className="w-full sm:w-auto" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
            Đang gửi...
          </>
        ) : (
          <>
            <Send className="size-4" aria-hidden="true" />
            Gửi yêu cầu tư vấn
          </>
        )}
      </Button>
    </form>
  );
}
