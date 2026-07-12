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
import { formatError } from "@/lib/errors/format-error";

type SubmissionStatus =
  | { type: "idle"; message: "" }
  | { type: "success" | "error"; message: string };

const INITIAL_STATUS: SubmissionStatus = { type: "idle", message: "" };

function isContactCourseOption(value: string): value is ContactCourseOption {
  return CONTACT_COURSE_OPTIONS.some((option) => option === value);
}

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] =
    useState<SubmissionStatus>(INITIAL_STATUS);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const courseInterest = String(formData.get("courseInterest") ?? "");

    if (!isContactCourseOption(courseInterest)) {
      setSubmissionStatus({
        type: "error",
        message: "Vui lòng chọn một khóa học hợp lệ.",
      });
      return;
    }

    const email = String(formData.get("email") ?? "").trim();
    const learningNeeds = String(formData.get("learningNeeds") ?? "").trim();
    const payload: ContactFormPayload = {
      fullName: String(formData.get("fullName") ?? "").trim(),
      phone: String(formData.get("phone") ?? "").trim(),
      courseInterest,
      ...(email ? { email } : {}),
      ...(learningNeeds ? { learningNeeds } : {}),
    };

    setIsSubmitting(true);
    setSubmissionStatus(INITIAL_STATUS);

    try {
      const response = await submitContactForm(payload);
      form.reset();
      setSubmissionStatus({ type: "success", message: response.message });
    } catch (error) {
      setSubmissionStatus({ type: "error", message: formatError(error) });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
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
            minLength={2}
            required
          />
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
            placeholder="0901 234 567"
            pattern="[0-9 +()-]{9,16}"
            required
          />
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
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="contact-course">
          Khóa học quan tâm <span className="ml-0.5 text-primary">*</span>
        </Label>
        <select
          id="contact-course"
          name="courseInterest"
          defaultValue=""
          required
          className="h-12 w-full cursor-pointer rounded-lg border border-border bg-[#FFF9F5] px-4 py-3 text-[#4A2306] outline-none transition-all focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary font-[family-name:var(--font-body)]"
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
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="contact-message">Nhu cầu học tập (không bắt buộc)</Label>
        <Textarea
          id="contact-message"
          name="learningNeeds"
          rows={4}
          placeholder="Chia sẻ nhu cầu hoặc câu hỏi của bạn với chúng tôi..."
        />
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
