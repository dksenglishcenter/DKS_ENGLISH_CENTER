import {
  Award,
  Globe,
  GraduationCap,
  Heart,
  Lightbulb,
  Users,
} from "lucide-react";

import { Container } from "@/components/layout/container";
import { SectionHeading } from "@/components/layout/section-heading";

export function WhyChooseUs() {
  const features = [
    { icon: <Heart className="w-7 h-7"/>, title: "Giáo Viên Nhiệt Tâm", desc: "Đội ngũ giáo viên tận tâm, yêu nghề, luôn đặt sự tiến bộ của học viên lên hàng đầu." },
    { icon: <Lightbulb className="w-7 h-7"/>, title: "Phương Pháp Sáng Tạo", desc: "Kết hợp phương pháp giảng dạy hiện đại với công nghệ AI, giúp học viên tiến bộ nhanh và vui vẻ." },
    { icon: <GraduationCap className="w-7 h-7"/>, title: "Cam Kết Kết Quả", desc: "Cam kết hoàn tiền nếu không đạt mục tiêu sau khóa học. Học viên là ưu tiên số một." },
    { icon: <Users className="w-7 h-7"/>, title: "Lớp Học Nhỏ", desc: "Tối đa 12 học viên mỗi lớp, đảm bảo giáo viên chú ý và hỗ trợ từng em một cách hiệu quả." },
    { icon: <Award className="w-7 h-7"/>, title: "Cơ Sở Hiện Đại", desc: "Phòng học được trang bị màn hình tương tác, âm thanh chất lượng cao và không gian thoải mái." },
    { icon: <Globe className="w-7 h-7"/>, title: "Kết Nối Toàn Cầu", desc: "Tạo cơ hội giao lưu với học viên quốc tế, mở rộng mạng lưới và trải nghiệm văn hóa đa dạng." },
  ];

  return (
    <section className="py-20 md:py-28 bg-secondary">
      <Container>
        <SectionHeading
          label="Tại sao chọn DKS?"
          title="Điều Làm Nên Sự Khác Biệt"
          sub="Chúng tôi không chỉ dạy tiếng Anh – chúng tôi xây dựng nền tảng để bạn tự tin chinh phục thế giới."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div key={i} className="bg-white rounded-2xl p-7 border border-border hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
              <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center text-primary mb-5">
                {f.icon}
              </div>
              <h3 className="text-lg font-black text-[#4A2306] mb-3 font-[family-name:var(--font-nunito)]">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed font-[family-name:var(--font-body)]">{f.desc}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
