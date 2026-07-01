import { ArrowRight, Target } from "lucide-react";

import { Container } from "@/components/layout/container";
import { SectionHeading } from "@/components/layout/section-heading";
import { UnsplashImage } from "@/components/media/unsplash-image";
import { Button } from "@/components/ui/button";
import { COURSES } from "@/data/courses";
import type { SetPage } from "@/lib/navigation";

export function CoursesSection({ setPage }: { setPage: SetPage }) {
  return (
    <section className="py-20 md:py-28 bg-white">
      <Container>
        <SectionHeading
          label="Khóa học nổi bật"
          title="Chương Trình Học Tại DKS"
          sub="Đa dạng khóa học phù hợp với mọi mục tiêu – từ luyện thi IELTS, thi vào 10, giao tiếp đến gia sư cá nhân."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {COURSES.map((c) => (
            <div key={c.id} className="group bg-white rounded-2xl border border-border hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer" onClick={() => setPage("courses")}>
              <div className="relative h-40 overflow-hidden" style={{ background: c.bg }}>
                <UnsplashImage id={c.imgId} alt={c.subtitle} className="w-full h-full opacity-60 group-hover:scale-105 transition-transform duration-300"/>
                <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${c.accent}CC, transparent)` }}/>
                <div className="absolute top-3 left-3 text-3xl">{c.icon}</div>
                <div className="absolute bottom-3 left-3 right-3">
                  <div className="text-white text-xs font-bold bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 inline-block font-[family-name:var(--font-nunito)]">
                    {c.level}
                  </div>
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-black text-[#4A2306] text-base mb-1 font-[family-name:var(--font-nunito)]">{c.title}</h3>
                <p className="text-xs text-muted-foreground mb-3 font-[family-name:var(--font-body)]">{c.subtitle}</p>
                <div className="flex items-center gap-1 mb-3">
                  <Target className="w-3.5 h-3.5 text-primary flex-shrink-0"/>
                  <span className="text-xs font-semibold text-primary font-[family-name:var(--font-body)]">{c.target}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black text-[#4A2306] font-[family-name:var(--font-nunito)]">{c.tuition}</span>
                  <div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center group-hover:bg-primary transition-colors">
                    <ArrowRight className="w-3.5 h-3.5 text-primary group-hover:text-white transition-colors"/>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-10">
          <Button onClick={() => setPage("courses")} variant="outline" size="lg">
            Xem tất cả khóa học <ArrowRight className="w-5 h-5"/>
          </Button>
        </div>
      </Container>
    </section>
  );
}
