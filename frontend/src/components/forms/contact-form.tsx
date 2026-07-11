"use client";

import { useState } from "react";
import { Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const COURSE_OPTIONS = [
  "IELTS Preparation",
  "9-to-10 Prep",
  "Communicative English",
  "1-on-1 Tutoring",
] as const;

export function ContactForm() {
  const [statusMessage, setStatusMessage] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatusMessage(
      "Gửi biểu mẫu thành công, đội ngũ DKS sẽ liên hệ với bạn trong thời gian sớm nhất.",
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate={false}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="contact-name">
            Họ và tên <span className="ml-0.5 text-primary">*</span>
          </Label>
          <Input
            id="contact-name"
            name="name"
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
          name="course"
          defaultValue=""
          required
          className="h-12 w-full cursor-pointer rounded-lg border border-border bg-[#FFF9F5] px-4 py-3 text-[#4A2306] outline-none transition-all focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary font-[family-name:var(--font-body)]"
        >
          <option value="" disabled>
            -- Chọn khóa học quan tâm --
          </option>
          {COURSE_OPTIONS.map((course) => (
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
          name="message"
          rows={4}
          placeholder="Chia sẻ nhu cầu hoặc câu hỏi của bạn với chúng tôi..."
        />
      </div>

      {statusMessage && (
        <p
          role="status"
          aria-live="polite"
          className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm leading-relaxed text-[#4A2306]"
        >
          {statusMessage}
        </p>
      )}

      <Button type="submit" className="min-h-12 w-full justify-center" size="lg">
        <Send className="h-5 w-5" aria-hidden="true" />
        Đăng ký ngay – Miễn phí!
      </Button>
    </form>
  );
}
