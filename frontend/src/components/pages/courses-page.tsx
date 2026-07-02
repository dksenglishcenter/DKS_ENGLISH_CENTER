"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Award,
  BookOpen,
  Check,
  Clock,
  Target,
} from "lucide-react";

import { Container } from "@/components/layout/container";
import { PageHero } from "@/components/layout/page-hero";
import { UnsplashImage } from "@/components/media/unsplash-image";
import { Button } from "@/components/ui/button";
import { COURSES } from "@/data/courses";
import { PAGE_PATHS } from "@/lib/navigation-paths";

export function CoursesPage() {
  const [active, setActive] = useState("all");
  const tabs = [
    { id: "all", label: "Tất cả" },
    { id: "ielts", label: "IELTS" },
    { id: "highschool", label: "Luyện thi" },
    { id: "comm", label: "Giao tiếp" },
    { id: "tutoring", label: "Gia sư 1-1" },
  ];
  const filtered = active === "all" ? COURSES : COURSES.filter((c) => c.id === active);

  return (
    <div className="bg-background min-h-screen">
      <PageHero
        label="Khóa học DKS"
        title="Chọn Khóa Học Phù Hợp"
        description="Từ IELTS đến giao tiếp hàng ngày – DKS có đủ chương trình để bạn đạt mọi mục tiêu tiếng Anh."
      />

      <Container className="py-16">
        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-border p-6 sticky top-24">
              <h3 className="font-black text-[#4A2306] mb-4 font-[family-name:var(--font-nunito)]">Lọc theo loại</h3>
              <div className="flex flex-col gap-2">
                {tabs.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setActive(t.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg font-semibold text-sm transition-all font-[family-name:var(--font-nunito)] ${
                      active === t.id ? "bg-primary text-white" : "text-[#4A2306] hover:bg-secondary"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <div className="mt-8 p-4 rounded-xl" style={{ background: "linear-gradient(135deg, #FFF4EC, #FFFBF0)" }}>
                <div className="text-2xl mb-2">🤔</div>
                <p className="text-sm font-semibold text-[#4A2306] mb-3 font-[family-name:var(--font-nunito)]">Chưa biết chọn khóa nào?</p>
                <Button asChild size="sm" className="w-full justify-center text-xs">
                  <Link href={PAGE_PATHS.contact}>Tư vấn miễn phí</Link>
                </Button>
              </div>
            </div>
          </aside>

          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filtered.map((c) => (
                <article key={c.id} id={c.id} className="bg-white rounded-2xl border border-border overflow-hidden hover:shadow-xl transition-shadow duration-300">
                  <div className="relative h-48 overflow-hidden" style={{ background: c.bg }}>
                    <UnsplashImage
                      id={c.imgId}
                      alt={c.subtitle}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="opacity-70 hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${c.accent}BB 0%, transparent 60%)` }}/>
                    <div className="absolute top-4 left-4 text-4xl">{c.icon}</div>
                    <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                      <div>
                        <div className="text-white font-black text-lg font-[family-name:var(--font-nunito)]">{c.title}</div>
                        <div className="text-white/80 text-sm font-[family-name:var(--font-body)]">{c.subtitle}</div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <p className="text-muted-foreground text-sm mb-5 leading-relaxed font-[family-name:var(--font-body)]">{c.desc}</p>

                    <div className="grid grid-cols-2 gap-3 mb-5 text-sm">
                      {[
                        { icon: <BookOpen className="w-3.5 h-3.5"/>, label: "Trình độ", val: c.level },
                        { icon: <Target className="w-3.5 h-3.5"/>, label: "Mục tiêu", val: c.target },
                        { icon: <Clock className="w-3.5 h-3.5"/>, label: "Thời gian", val: c.imgId.includes("1434") ? "3–6 tháng" : "Linh hoạt" },
                        { icon: <Award className="w-3.5 h-3.5"/>, label: "Học phí", val: c.tuition },
                      ].map((item) => (
                        <div key={item.label} className="bg-secondary rounded-lg p-2.5">
                          <div className="flex items-center gap-1.5 text-muted-foreground mb-0.5">
                            <span className="text-primary">{item.icon}</span>
                            <span className="text-xs font-[family-name:var(--font-body)]">{item.label}</span>
                          </div>
                          <div className="font-semibold text-[#4A2306] text-xs font-[family-name:var(--font-body)]">{item.val}</div>
                        </div>
                      ))}
                    </div>

                    <div className="mb-5">
                      <div className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wide font-[family-name:var(--font-nunito)]">Điểm nổi bật</div>
                      <ul className="space-y-1.5">
                        {c.perks.map((p, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm text-[#4A2306] font-[family-name:var(--font-body)]">
                            <Check className="w-4 h-4 text-primary flex-shrink-0"/>
                            {p}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Button asChild className="w-full justify-center">
                      <Link href={PAGE_PATHS.contact}>
                        Nhận tư vấn miễn phí <ArrowRight className="w-4 h-4"/>
                      </Link>
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
