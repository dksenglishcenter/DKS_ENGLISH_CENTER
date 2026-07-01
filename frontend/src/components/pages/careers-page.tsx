"use client";

import { useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Briefcase,
  Check,
  Heart,
  MapPin,
  Send,
} from "lucide-react";

import { InputField } from "@/components/forms/input-field";
import { SelectField } from "@/components/forms/select-field";
import { TextareaField } from "@/components/forms/textarea-field";
import { Container } from "@/components/layout/container";
import { PageHero } from "@/components/layout/page-hero";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { JOBS } from "@/data/jobs";

export function CareersPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", position: "", message: "" });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 3000);
    setForm({ name: "", email: "", phone: "", position: "", message: "" });
  };

  return (
    <div className="bg-background">
      <PageHero
        label="Tuyển dụng"
        title={<>Cùng DKS Tạo Ra<br/>Sự Khác Biệt</>}
        description="Bạn đam mê giáo dục, yêu tiếng Anh và muốn tạo ra tác động tích cực? DKS đang tìm kiếm bạn!"
      />

      <Container className="py-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-14">
          <div className="lg:col-span-3">
            <h2 className="text-2xl font-black text-[#4A2306] mb-6 font-[family-name:var(--font-nunito)]">
              Vị Trí Đang Tuyển ({JOBS.length})
            </h2>
            <Accordion type="single" collapsible className="space-y-4">
              {JOBS.map((job) => (
                <AccordionItem
                  key={job.id}
                  id={`job-${job.id}`}
                  value={String(job.id)}
                  className="bg-white rounded-2xl border border-border overflow-hidden transition-shadow hover:shadow-md border-b-0"
                >
                  <AccordionTrigger className="w-full flex items-start gap-4 p-6 text-left hover:no-underline [&>svg]:text-primary [&>svg]:mt-1">
                    <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Briefcase className="w-5 h-5 text-primary"/>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-black text-[#4A2306] mb-1 font-[family-name:var(--font-nunito)]">{job.title}</h3>
                      <div className="flex flex-wrap gap-2 text-xs font-[family-name:var(--font-body)]">
                        <span className="bg-secondary text-muted-foreground px-2 py-0.5 rounded-full">{job.type}</span>
                        <span className="bg-secondary text-muted-foreground px-2 py-0.5 rounded-full flex items-center gap-1"><MapPin className="w-3 h-3"/>{job.location}</span>
                        <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold">{job.salary}</span>
                      </div>
                    </div>
                  </AccordionTrigger>

                  <AccordionContent className="px-6 pb-6 space-y-5">
                    <div className="text-xs text-muted-foreground bg-secondary rounded-lg px-4 py-2.5 font-[family-name:var(--font-body)]">
                      <span className="font-semibold text-[#4A2306]">Yêu cầu: </span>{job.req}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <h4 className="text-sm font-black text-[#4A2306] mb-3 flex items-center gap-1.5 font-[family-name:var(--font-nunito)]">
                          <BookOpen className="w-4 h-4 text-primary"/> Nhiệm vụ
                        </h4>
                        <ul className="space-y-2">
                          {job.duties.map((d, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground font-[family-name:var(--font-body)]">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0 mt-1.5"/>
                              {d}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-[#4A2306] mb-3 flex items-center gap-1.5 font-[family-name:var(--font-nunito)]">
                          <Heart className="w-4 h-4 text-primary"/> Quyền lợi
                        </h4>
                        <ul className="space-y-2">
                          {job.benefits.map((b, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground font-[family-name:var(--font-body)]">
                              <Check className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5"/>
                              {b}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <Button size="sm" onClick={() => {}}>
                      Ứng tuyển ngay <ArrowRight className="w-4 h-4"/>
                    </Button>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-border p-8 sticky top-24">
              <div className="text-3xl mb-3">✉️</div>
              <h2 className="text-xl font-black text-[#4A2306] mb-1 font-[family-name:var(--font-nunito)]">Gửi Đơn Ứng Tuyển</h2>
              <p className="text-sm text-muted-foreground mb-6 font-[family-name:var(--font-body)]">Điền thông tin và chúng tôi sẽ liên hệ trong 24 giờ.</p>

              {sent ? (
                <div className="bg-secondary rounded-xl p-6 text-center">
                  <div className="text-4xl mb-3">🎉</div>
                  <h3 className="font-black text-[#4A2306] mb-2 font-[family-name:var(--font-nunito)]">Đã gửi thành công!</h3>
                  <p className="text-sm text-muted-foreground font-[family-name:var(--font-body)]">Chúng tôi sẽ liên hệ với bạn trong 24 giờ.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <InputField label="Họ và tên" placeholder="Nguyễn Văn A" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
                  <InputField label="Email" type="email" placeholder="email@example.com" value={form.email} onChange={(v) => setForm({ ...form, email: v })} required />
                  <InputField label="Số điện thoại" type="tel" placeholder="0901 234 567" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} required />
                  <SelectField label="Vị trí ứng tuyển" value={form.position} onChange={(v) => setForm({ ...form, position: v })} options={JOBS.map((j) => j.title)} required placeholder="-- Chọn vị trí ứng tuyển --" />
                  <TextareaField label="Giới thiệu bản thân" placeholder="Chia sẻ về kinh nghiệm và lý do bạn muốn gia nhập DKS..." value={form.message} onChange={(v) => setForm({ ...form, message: v })} rows={4} />
                  <Button type="submit" className="w-full justify-center" size="md">
                    <Send className="w-4 h-4"/> Gửi đơn ứng tuyển
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
