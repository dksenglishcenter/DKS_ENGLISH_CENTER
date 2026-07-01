"use client";

import { useState } from "react";
import { Clock, Mail, MapPin, Phone, Send } from "lucide-react";

import { InputField } from "@/components/forms/input-field";
import { SelectField } from "@/components/forms/select-field";
import { TextareaField } from "@/components/forms/textarea-field";
import { Container } from "@/components/layout/container";
import { PageHero } from "@/components/layout/page-hero";
import { Button } from "@/components/ui/button";

export function ContactPage() {
  const [form, setForm] = useState({ name: "", phone: "", email: "", course: "", message: "" });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 3000);
    setForm({ name: "", phone: "", email: "", course: "", message: "" });
  };

  return (
    <div className="bg-background">
      <PageHero
        label="Liên hệ"
        title={<>Chúng Tôi Sẵn Sàng<br/>Hỗ Trợ Bạn</>}
        description="Có câu hỏi hay muốn đăng ký học thử? Hãy để lại thông tin – DKS sẽ liên hệ trong vòng 30 phút!"
      />

      <Container className="py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-black text-[#4A2306] mb-6 font-[family-name:var(--font-nunito)]">Thông Tin Liên Hệ</h2>
              <div className="space-y-5">
                {[
                  { icon: <MapPin className="w-5 h-5"/>, label: "Địa chỉ", val: "63 Ngõ 120 Dương Văn Bé, Vĩnh Tuy, Hai Bà Trưng, Hà Nội" },
                  { icon: <Phone className="w-5 h-5"/>, label: "Hotline", val: "083 451 3456 (8:00 – 21:00)" },
                  { icon: <Mail className="w-5 h-5"/>, label: "Email", val: "dksenglishcenter@gmail.com" },
                  { icon: <Clock className="w-5 h-5"/>, label: "Giờ mở cửa", val: "Thứ 2 – Chủ Nhật: 7:00 – 21:00" },
                ].map((info) => (
                  <div key={info.label} className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center text-primary flex-shrink-0">
                      {info.icon}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-0.5 font-[family-name:var(--font-body)]">{info.label}</div>
                      <div className="text-sm font-medium text-[#4A2306] font-[family-name:var(--font-body)]">{info.val}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-black text-[#4A2306] mb-4 font-[family-name:var(--font-nunito)]">Mạng xã hội</h3>
              <div className="flex flex-wrap gap-3">
                {[
                  { name: "Zalo", icon: "💬", color: "#0068FF" },
                  { name: "Facebook", icon: "📘", color: "#1877F2" },
                  { name: "YouTube", icon: "▶", color: "#FF0000" },
                  { name: "TikTok", icon: "♪", color: "#010101" },
                ].map((s) => (
                  <button
                    key={s.name}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-opacity font-[family-name:var(--font-nunito)]"
                    style={{ background: s.color }}
                  >
                    <span>{s.icon}</span> {s.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative rounded-2xl overflow-hidden bg-secondary" style={{ height: 280 }}>
              <div className="absolute inset-0 flex items-center justify-center flex-col gap-4">
                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white text-2xl shadow-xl">📍</div>
                <div className="text-center">
                  <div className="font-black text-[#4A2306] mb-1 font-[family-name:var(--font-nunito)]">DKS English Center</div>
                  <div className="text-sm text-muted-foreground font-[family-name:var(--font-body)]">63 Ngõ 120 Dương Văn Bé, Vĩnh Tuy, Hà Nội</div>
                  <button className="mt-3 text-primary text-sm font-semibold underline underline-offset-2 hover:text-[#D95518] transition-colors font-[family-name:var(--font-body)]">
                    Mở Google Maps →
                  </button>
                </div>
              </div>
              <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 400 280">
                {Array.from({ length: 10 }).map((_, i) => <line key={`v${i}`} x1={i * 44} y1="0" x2={i * 44} y2="280" stroke="#4A2306" strokeWidth="1"/>)}
                {Array.from({ length: 8 }).map((_, i) => <line key={`h${i}`} x1="0" y1={i * 40} x2="400" y2={i * 40} stroke="#4A2306" strokeWidth="1"/>)}
              </svg>
            </div>
          </div>

          <div>
            <div className="bg-white rounded-2xl border border-border p-8">
              <div className="text-3xl mb-3">📝</div>
              <h2 className="text-xl font-black text-[#4A2306] mb-1 font-[family-name:var(--font-nunito)]">Đăng Ký Tư Vấn Miễn Phí</h2>
              <p className="text-sm text-muted-foreground mb-6 font-[family-name:var(--font-body)]">
                Điền form bên dưới – chuyên viên tư vấn sẽ gọi cho bạn trong vòng 30 phút!
              </p>

              {sent ? (
                <div className="bg-secondary rounded-xl p-8 text-center">
                  <div className="text-5xl mb-4">🎉</div>
                  <h3 className="text-xl font-black text-[#4A2306] mb-2 font-[family-name:var(--font-nunito)]">Đăng ký thành công!</h3>
                  <p className="text-muted-foreground font-[family-name:var(--font-body)]">Chuyên viên sẽ gọi cho bạn trong vòng 30 phút. Cảm ơn bạn đã tin tưởng DKS!</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InputField label="Họ và tên" placeholder="Nguyễn Văn A" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
                    <InputField label="Số điện thoại" type="tel" placeholder="0901 234 567" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} required />
                  </div>
                  <InputField label="Email" type="email" placeholder="email@example.com" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
                  <SelectField
                    label="Khóa học quan tâm"
                    value={form.course}
                    onChange={(v) => setForm({ ...form, course: v })}
                    options={["IELTS Preparation", "9-to-10 Prep", "Communicative English", "1-on-1 Tutoring"]}
                    required
                    placeholder="-- Chọn khóa học quan tâm --"
                  />
                  <TextareaField
                    label="Lời nhắn (không bắt buộc)"
                    placeholder="Chia sẻ mục tiêu hoặc câu hỏi của bạn với chúng tôi..."
                    value={form.message}
                    onChange={(v) => setForm({ ...form, message: v })}
                    rows={4}
                  />
                  <div className="p-4 bg-secondary rounded-xl text-xs text-muted-foreground font-[family-name:var(--font-body)]">
                    🔒 Thông tin của bạn được bảo mật tuyệt đối, không chia sẻ với bên thứ ba.
                  </div>
                  <Button type="submit" className="w-full justify-center" size="lg">
                    <Send className="w-5 h-5"/> Đăng ký ngay – Miễn phí!
                  </Button>
                </form>
              )}
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="bg-secondary rounded-xl p-5 text-center">
                <div className="text-2xl mb-2">💬</div>
                <div className="font-bold text-[#4A2306] text-sm mb-1 font-[family-name:var(--font-nunito)]">Chat Zalo</div>
                <div className="text-xs text-muted-foreground font-[family-name:var(--font-body)]">Phản hồi ngay lập tức</div>
              </div>
              <div className="bg-secondary rounded-xl p-5 text-center">
                <div className="text-2xl mb-2">📞</div>
                <div className="font-bold text-[#4A2306] text-sm mb-1 font-[family-name:var(--font-nunito)]">Gọi ngay</div>
                <div className="text-xs text-muted-foreground font-[family-name:var(--font-body)]">0901 234 567</div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
