import { Container } from "@/components/layout/container";
import type { SetPage } from "@/lib/navigation";

export function CTABanner({ setPage }: { setPage: SetPage }) {
  return (
    <section className="py-20 md:py-24" style={{ background: "linear-gradient(135deg, #F16522 0%, #FFA200 100%)" }}>
      <Container>
        <div className="text-center text-white">
          <div className="text-4xl mb-4">🚀</div>
          <h2 className="text-3xl md:text-4xl font-black mb-4 font-[family-name:var(--font-nunito)]">
            Sẵn sàng bắt đầu hành trình của bạn?
          </h2>
          <p className="text-lg text-orange-50 mb-8 max-w-xl mx-auto font-[family-name:var(--font-body)]">
            Đăng ký học thử miễn phí ngay hôm nay – không cần cam kết, không phí ẩn.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => setPage("contact")}
              className="bg-white text-primary font-bold px-8 py-4 rounded-lg hover:bg-orange-50 transition-colors text-lg font-[family-name:var(--font-nunito)]"
            >
              Đăng ký học thử miễn phí
            </button>
            <button
              onClick={() => setPage("courses")}
              className="border-2 border-white text-white font-bold px-8 py-4 rounded-lg hover:bg-white/10 transition-colors text-lg font-[family-name:var(--font-nunito)]"
            >
              Xem các khóa học
            </button>
          </div>
        </div>
      </Container>
    </section>
  );
}
