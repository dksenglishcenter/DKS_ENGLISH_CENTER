"use client";

import { useRef, useState } from "react";
import { FileUp, LoaderCircle, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitCareerApplication, uploadCareerCv } from "@/lib/careers/api";
import type { CareerApplicationPayload } from "@/lib/careers/types";
import {
  containsHtmlCharacters,
  getEmailValidationError,
  getNameValidationError,
} from "@/lib/validation/person";
import { getPublicFormSubmissionError } from "@/lib/validation/form-submit";
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
  cvMaxBytes: 5 * 1024 * 1024,
} as const;

const CV_ACCEPT =
  ".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

type CareerFormValues = {
  fullName: string;
  email: string;
  phone: string;
  jobId: string;
  introduction: string;
};

type CareerField = keyof CareerFormValues | "cvFile";
type FieldErrors = Partial<Record<CareerField, string>>;

const INITIAL_FORM_VALUES: CareerFormValues = {
  fullName: "",
  email: "",
  phone: "",
  jobId: "",
  introduction: "",
};

const CAREER_FIELDS: (keyof CareerFormValues)[] = [
  "fullName",
  "email",
  "phone",
  "jobId",
  "introduction",
];

function isAllowedCvFile(file: File) {
  const name = file.name.toLowerCase();
  const byExt =
    name.endsWith(".pdf") || name.endsWith(".doc") || name.endsWith(".docx");
  const mime = file.type.toLowerCase();
  const byMime =
    mime === "application/pdf" ||
    mime === "application/msword" ||
    mime ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  return byExt || byMime;
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
    return getNameValidationError(value, {
      min: FORM_LIMITS.fullName.min,
      max: FORM_LIMITS.fullName.max,
      requireSpace: true,
    });
  }

  if (field === "email") {
    return getEmailValidationError(value, {
      required: true,
      max: FORM_LIMITS.email,
    });
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
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState("");
  const cvInputRef = useRef<HTMLInputElement>(null);

  function updateField(field: keyof CareerFormValues, value: string) {
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

  function validateField(field: keyof CareerFormValues) {
    setFieldErrors((current) => ({
      ...current,
      [field]: getFieldError(field, values[field], positions),
    }));
  }

  function handleCvChange(fileList: FileList | null) {
    setSubmissionError("");
    const file = fileList?.[0] ?? null;
    if (!file) {
      setCvFile(null);
      return;
    }
    if (!isAllowedCvFile(file)) {
      setCvFile(null);
      setFieldErrors((current) => ({
        ...current,
        cvFile: "Chỉ chấp nhận PDF hoặc Word (.pdf, .doc, .docx).",
      }));
      if (cvInputRef.current) cvInputRef.current.value = "";
      return;
    }
    if (file.size > FORM_LIMITS.cvMaxBytes) {
      setCvFile(null);
      setFieldErrors((current) => ({
        ...current,
        cvFile: "File CV tối đa 5MB.",
      }));
      if (cvInputRef.current) cvInputRef.current.value = "";
      return;
    }
    setCvFile(file);
    setFieldErrors((current) => {
      const next = { ...current };
      delete next.cvFile;
      return next;
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    const form = event.currentTarget;
    const normalizedValues = normalizeFormValues(values);
    const errors = validateForm(normalizedValues, positions);
    if (!cvFile) {
      errors.cvFile = "Vui lòng đính kèm CV / portfolio (PDF hoặc Word).";
    }
    const firstInvalidField =
      CAREER_FIELDS.find((field) => errors[field]) ??
      (errors.cvFile ? "cvFile" : undefined);

    setValues(normalizedValues);
    setFieldErrors(errors);
    setSubmissionError("");

    if (firstInvalidField === "cvFile") {
      cvInputRef.current?.focus();
      return;
    }
    if (firstInvalidField) {
      const firstInvalidControl = form.elements.namedItem(firstInvalidField);
      if (firstInvalidControl instanceof HTMLElement)
        firstInvalidControl.focus();
      return;
    }

    if (!isCareerPosition(normalizedValues.jobId, positions) || !cvFile) return;

    setIsSubmitting(true);

    try {
      const uploaded = await uploadCareerCv(cvFile);
      const payload: CareerApplicationPayload = {
        jobId: normalizedValues.jobId,
        fullName: normalizedValues.fullName,
        email: normalizedValues.email,
        phone: normalizedValues.phone,
        cvUrl: uploaded.url,
        cvFileName: uploaded.fileName,
        ...(normalizedValues.introduction
          ? { introduction: normalizedValues.introduction }
          : {}),
      };

      const response = await submitCareerApplication(payload);
      setValues({ ...INITIAL_FORM_VALUES, jobId: initialJobId });
      setCvFile(null);
      if (cvInputRef.current) cvInputRef.current.value = "";
      setFieldErrors({});
      onSuccess?.(response.message);
    } catch (error) {
      setSubmissionError(getPublicFormSubmissionError(error));
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
            Chọn vị trí ứng tuyển
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
        <Label htmlFor="career-cv">
          CV / Portfolio <span className="ml-0.5 text-primary">*</span>
        </Label>
        <div
          className={cn(
            "flex flex-col gap-2 rounded-lg border border-dashed bg-input-background px-4 py-3",
            fieldErrors.cvFile ? "border-red-500" : "border-border",
          )}
        >
          <input
            ref={cvInputRef}
            id="career-cv"
            name="cvFile"
            type="file"
            accept={CV_ACCEPT}
            className="sr-only"
            onChange={(event) => handleCvChange(event.target.files)}
            required
          />
          <Button
            type="button"
            variant="outline"
            className="w-full justify-center sm:w-auto"
            disabled={isSubmitting}
            onClick={() => cvInputRef.current?.click()}
          >
            <FileUp className="h-4 w-4" aria-hidden="true" />
            {cvFile ? "Đổi file" : "Add file"}
          </Button>
          <p className="text-xs text-muted-foreground">
            {cvFile
              ? `Đã chọn: ${cvFile.name}`
              : "Bắt buộc · PDF hoặc Word (.pdf, .doc, .docx) · tối đa 5MB"}
          </p>
        </div>
        <FieldError id="career-cv-error" error={fieldErrors.cvFile} />
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
