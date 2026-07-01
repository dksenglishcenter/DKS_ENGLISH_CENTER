"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Container } from "@/components/layout/container";
import { SectionHeading } from "@/components/layout/section-heading";
import { StarRow } from "@/components/media/star-row";
import { TESTIMONIALS } from "@/data/testimonials";

export function TestimonialsSection() {
  const [idx, setIdx] = useState(0);
  const prev = () => setIdx((idx - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  const next = () => setIdx((idx + 1) % TESTIMONIALS.length);
  const t = TESTIMONIALS[idx];

  return (
    <section className="py-20 md:py-28 bg-white">
      <Container>
        <SectionHeading
          label="Học viên nói gì?"
          title="Câu Chuyện Thành Công"
          sub="Hàng nghìn học viên đã thay đổi cuộc đời với DKS. Đây là một vài câu chuyện truyền cảm hứng."
        />
        <div className="max-w-3xl mx-auto">
          <div className="bg-secondary rounded-2xl p-8 md:p-12 relative">
            <div className="text-6xl text-primary/20 font-black absolute top-6 left-8 font-[family-name:var(--font-nunito)]">"</div>
            <StarRow count={t.stars} />
            <p className="text-[#4A2306] text-lg md:text-xl leading-relaxed my-6 relative z-10 font-[family-name:var(--font-body)]">
              {t.text}
            </p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-black font-[family-name:var(--font-nunito)]">
                {t.avatar}
              </div>
              <div>
                <div className="font-black text-[#4A2306] font-[family-name:var(--font-nunito)]">{t.name}</div>
                <div className="text-sm text-muted-foreground font-[family-name:var(--font-body)]">{t.course}</div>
              </div>
              <div className="ml-auto">
                <div className="inline-flex items-center gap-1.5 bg-primary text-white rounded-full px-4 py-1.5 text-xs font-bold font-[family-name:var(--font-nunito)]">
                  🏆 {t.badge}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 mt-8">
            <button onClick={prev} className="w-10 h-10 rounded-full border-2 border-primary text-primary hover:bg-primary hover:text-white flex items-center justify-center transition-colors">
              <ChevronLeft className="w-5 h-5"/>
            </button>
            {TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                className={`rounded-full transition-all duration-200 ${i === idx ? "w-8 h-3 bg-primary" : "w-3 h-3 bg-border hover:bg-primary/50"}`}
              />
            ))}
            <button onClick={next} className="w-10 h-10 rounded-full border-2 border-primary text-primary hover:bg-primary hover:text-white flex items-center justify-center transition-colors">
              <ChevronRight className="w-5 h-5"/>
            </button>
          </div>
        </div>
      </Container>
    </section>
  );
}
