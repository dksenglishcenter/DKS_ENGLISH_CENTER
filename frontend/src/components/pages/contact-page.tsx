"use client";

import { useState } from "react";
import { Clock, Mail, MapPin, Phone, Send } from "lucide-react";

import { InputField } from "@/components/forms/input-field";
import { SelectField } from "@/components/forms/select-field";
import { TextareaField } from "@/components/forms/textarea-field";
import { Container } from "@/components/layout/container";
import { PageHero } from "@/components/layout/page-hero";
import { Button } from "@/components/ui/button";
import { submitContactForm } from "@/lib/contact/api";
import { CONTACT_COURSE_OPTIONS } from "@/lib/contact/types";
import { formatError } from "@/lib/errors/format-error";

const SOCIAL_LINKS = [
  { label: "Zalo", emoji: "💬", color: "#0068FF" },
  { label: "Facebook", emoji: "📘", color: "#1877F2" },
  { label: "YouTube", emoji: "▶", color: "#FF0000" },
  { label: "TikTok", emoji: "🎵", color: "#111111" },
];

export function ContactPage() {
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    courseInterest: "",
    learningNeeds: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [feedback, setFeedback] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setFeedback("");

    try {
      const result = await submitContactForm({
        fullName: form.fullName,
        phone: form.phone,
        email: form.email || undefined,
        courseInterest: form.courseInterest as (typeof CONTACT_COURSE_OPTIONS)[number],
        learningNeeds: form.learningNeeds || undefined,
      });

      setStatus("success");
      setFeedback(result.message);
      setForm({
        fullName: "",
        phone: "",
        email: "",
        courseInterest: "",
        learningNeeds: "",
      });
    } catch (error) {
      setStatus("error");
      setFeedback(formatError(error));
    }
  };

  return (
    <div className="bg-background min-h-screen">
      <PageHero
        label="Liên hệ DKS"
        title="Liên Hệ & Đăng Ký Tư Vấn"
        description="Để lại thông tin — đội ngũ DKS sẽ gọi lại và tư vấn lộ trình học phù hợp nhất cho bạn."
      />

      <Container className="py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl font-black text-[#4A2306] mb-6 font-[family-name:var(--font-nunito)]">
              Thông tin liên hệ
            </h2>

            <ul className="space-y-5 mb-8">
              {[
                {
                  icon: <MapPin className="w-5 h-5 text-primary" />,
                  label: "Địa chỉ",
                  value: "63 Ngõ 120 Dương Văn Bé, Vĩnh Tuy, Hai Bà Trưng, Hà Nội",
                },
                {
                  icon: <Phone className="w-5 h-5 text-primary" />,
                  label: "Hotline",
                  value: "083 451 3456",
                },
                {
                  icon: <Mail className="w-5 h-5 text-primary" />,
                  label: "Email",
                  value: "dksenglishcenter@gmail.com",
                },
                {
                  icon: <Clock className="w-5 h-5 text-primary" />,
                  label: "Giờ mở cửa",
                  value: "Thứ 2 – Chủ Nhật: 7:00 – 21:00",
                },
              ].map((item) => (
                <li key={item.label} className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-muted-foreground uppercase tracking-wide font-[family-name:var(--font-nunito)]">
                      {item.label}
                    </div>
                    <div className="text-sm text-[#4A2306] font-[family-name:var(--font-body)]">{item.value}</div>
                  </div>
                </li>
              ))}
            </ul>

            <h3 className="text-sm font-bold text-[#4A2306] mb-3 font-[family-name:var(--font-nunito)]">Mạng xã hội</h3>
            <div className="flex flex-wrap gap-3 mb-8">
              {SOCIAL_LINKS.map((social) => (
                <button
                  key={social.label}
                  type="button"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-white text-sm font-semibold font-[family-name:var(--font-nunito)]"
                  style={{ background: social.color }}
                >
                  <span>{social.emoji}</span>
                  {social.label}
                </button>
              ))}
            </div>

            <div className="rounded-2xl overflow-hidden border border-border h-64 bg-secondary">
              <iframe
                title="Bản đồ DKS English Center"
                src="https://maps.google.com/maps?q=63+Ng%C3%B5+120+D%C6%B0%C6%A1ng+V%C4%83n+B%C3%A9,+V%C4%A9nh+Tuy,+Hai+B%C3%A0+Tr%C6%B0ng,+H%C3%A0+N%E1%BB%99i&output=embed"
                className="w-full h-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-border p-8 shadow-sm">
            <h2 className="text-2xl font-black text-[#4A2306] mb-2 font-[family-name:var(--font-nunito)]">
              Nhận Tư Vấn Lộ Trình Học Phù Hợp
            </h2>
            <p className="text-sm text-muted-foreground mb-6 font-[family-name:var(--font-body)]">
              Điền form bên dưới — DKS sẽ liên hệ trong vòng 24 giờ.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <InputField
                label="Họ và tên"
                placeholder="Nguyễn Văn A"
                value={form.fullName}
                onChange={(v) => setForm((prev) => ({ ...prev, fullName: v }))}
                required
              />
              <InputField
                label="Số điện thoại"
                type="tel"
                placeholder="0901 234 567"
                value={form.phone}
                onChange={(v) => setForm((prev) => ({ ...prev, phone: v }))}
                required
              />
              <InputField
                label="Email"
                type="email"
                placeholder="email@example.com"
                value={form.email}
                onChange={(v) => setForm((prev) => ({ ...prev, email: v }))}
              />
              <SelectField
                label="Khóa học quan tâm"
                placeholder="-- Chọn khóa học quan tâm --"
                value={form.courseInterest}
                onChange={(v) => setForm((prev) => ({ ...prev, courseInterest: v }))}
                options={[...CONTACT_COURSE_OPTIONS]}
                required
              />
              <TextareaField
                label="Nhu cầu học tập (không bắt buộc)"
                placeholder="Mục tiêu IELTS, lịch học, câu hỏi thêm..."
                value={form.learningNeeds}
                onChange={(v) => setForm((prev) => ({ ...prev, learningNeeds: v }))}
                rows={4}
              />

              {feedback && (
                <p
                  className={`text-sm rounded-lg px-4 py-3 font-[family-name:var(--font-body)] ${
                    status === "success"
                      ? "bg-green-50 text-green-800 border border-green-200"
                      : "bg-red-50 text-red-800 border border-red-200"
                  }`}
                >
                  {feedback}
                </p>
              )}

              <Button type="submit" className="w-full justify-center" disabled={status === "loading"}>
                {status === "loading" ? "Đang gửi..." : "Gửi đăng ký tư vấn"}
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </div>
      </Container>
    </div>
  );
}
