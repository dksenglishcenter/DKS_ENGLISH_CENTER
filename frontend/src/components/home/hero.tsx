import { ArrowRight } from "lucide-react";

import { FoxMascot } from "@/components/brand/fox-mascot";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import type { SetPage } from "@/lib/navigation";

export function Hero({ setPage }: { setPage: SetPage }) {
  return (
    <section className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, #FFF4EC 0%, #FFFBF0 50%, #FFF0E8 100%)" }}>
      <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full opacity-20" style={{ background: "radial-gradient(circle, #FFA200 0%, transparent 70%)", transform: "translate(30%, -30%)" }}/>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-15" style={{ background: "radial-gradient(circle, #F16522 0%, transparent 70%)", transform: "translate(-30%, 30%)" }}/>

      <Container className="relative py-20 md:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-6 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-white border border-border rounded-full px-4 py-2 text-sm font-bold text-primary mb-6 shadow-sm font-[family-name:var(--font-nunito)]">
              🎓 Hơn 2.000 học viên đã thay đổi cuộc đời
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-[#4A2306] leading-[1.15] mb-6 font-[family-name:var(--font-nunito)]">
              HỌC ĐÚNG CÁCH
              <br />
              <span className="text-primary">TIẾN XA</span>
              <br />
              MỖI NGÀY
            </h1>
            <p className="text-lg text-[#6B3E26] leading-relaxed mb-8 max-w-md font-[family-name:var(--font-body)]">
              DKS English Center – nơi mỗi học viên được truyền cảm hứng, học đúng phương pháp và đạt mục tiêu tiếng Anh nhanh nhất có thể.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button onClick={() => setPage("contact")} size="lg">
                Đăng ký ngay <ArrowRight className="w-5 h-5"/>
              </Button>
              <Button onClick={() => setPage("contact")} size="lg" variant="outline">
                Liên hệ tư vấn
              </Button>
            </div>

            <div className="flex flex-wrap gap-8 mt-12 pt-8 border-t border-border">
              {[
                { num: "2.000+", label: "Học viên" },
                { num: "95%", label: "Đạt mục tiêu" },
                { num: "8+", label: "Năm kinh nghiệm" },
                { num: "4.9★", label: "Đánh giá" },
              ].map((s) => (
                <div key={s.label}>
                  <div className="text-2xl font-black text-primary font-[family-name:var(--font-nunito)]">{s.num}</div>
                  <div className="text-sm text-muted-foreground font-medium font-[family-name:var(--font-body)]">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-center lg:justify-end">
            <div className="relative w-[280px] h-[340px] sm:w-[340px] sm:h-[400px]">
              <div className="absolute inset-0 rounded-full opacity-30" style={{ background: "radial-gradient(circle, #FFA200 0%, transparent 70%)" }}/>
              <FoxMascot />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
