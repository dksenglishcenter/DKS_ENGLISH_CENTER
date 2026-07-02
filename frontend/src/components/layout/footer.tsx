import Link from "next/link";
import { Clock, Mail, MapPin, Phone } from "lucide-react";

import { Container } from "@/components/layout/container";
import { PAGE_PATHS } from "@/lib/navigation-paths";

export function Footer() {
  return (
    <footer className="bg-[#4A2306] text-white">
      <Container className="py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-[10px] bg-primary flex items-center justify-center text-white font-black text-lg font-[family-name:var(--font-nunito)]">D</div>
              <div>
                <div className="font-black text-lg text-white font-[family-name:var(--font-nunito)]">DKS English Center</div>
                <div className="text-sm text-orange-200 font-[family-name:var(--font-body)]">Học đúng cách – Tiến xa mỗi ngày</div>
              </div>
            </div>
            <p className="text-orange-100 text-sm leading-relaxed mb-4 font-[family-name:var(--font-body)]">
              Trung tâm tiếng Anh hàng đầu tại TP. Hồ Chí Minh với phương pháp giảng dạy sáng tạo và đội ngũ giáo viên tận tâm.
            </p>
            <div className="flex gap-3">
              {["💬", "📘", "▶"].map((icon, i) => (
                <button key={i} className="w-9 h-9 rounded-lg bg-white/10 hover:bg-primary flex items-center justify-center text-sm transition-colors">
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4 font-[family-name:var(--font-nunito)]">Khóa học</h4>
            <ul className="space-y-2 text-sm text-orange-100 font-[family-name:var(--font-body)]">
              <li>
                <Link href={PAGE_PATHS.courses} className="hover:text-accent transition-colors">
                  Tất cả khóa học
                </Link>
              </li>
              <li>
                <Link href={`${PAGE_PATHS.courses}#ielts`} className="hover:text-accent transition-colors">
                  IELTS Preparation
                </Link>
              </li>
              <li>
                <Link href={`${PAGE_PATHS.courses}#highschool`} className="hover:text-accent transition-colors">
                  9-to-10 Prep
                </Link>
              </li>
              <li>
                <Link href={`${PAGE_PATHS.courses}#comm`} className="hover:text-accent transition-colors">
                  Communicative English
                </Link>
              </li>
              <li>
                <Link href={`${PAGE_PATHS.courses}#tutoring`} className="hover:text-accent transition-colors">
                  1-on-1 Tutoring
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4 font-[family-name:var(--font-nunito)]">Trang web</h4>
            <ul className="space-y-2 text-sm text-orange-100 font-[family-name:var(--font-body)]">
              <li>
                <Link href={PAGE_PATHS.about} className="hover:text-accent transition-colors">
                  Về chúng tôi
                </Link>
              </li>
              <li>
                <Link href={PAGE_PATHS.careers} className="hover:text-accent transition-colors">
                  Tuyển dụng
                </Link>
              </li>
              <li>
                <Link href={PAGE_PATHS.contact} className="hover:text-accent transition-colors">
                  Liên hệ
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4 font-[family-name:var(--font-nunito)]">Liên hệ</h4>
            <ul className="space-y-3 text-sm text-orange-100 font-[family-name:var(--font-body)]">
              <li className="flex items-start gap-2"><MapPin className="w-4 h-4 mt-0.5 text-accent flex-shrink-0"/><span>63 Ngõ 120 Dương Văn Bé, Vĩnh Tuy, Hai Bà Trưng, Hà Nội</span></li>
              <li className="flex items-center gap-2"><Phone className="w-4 h-4 text-accent flex-shrink-0"/><span>083 451 3456</span></li>
              <li className="flex items-center gap-2"><Mail className="w-4 h-4 text-accent flex-shrink-0"/><span>dksenglishcenter@gmail.com</span></li>
              <li className="flex items-center gap-2"><Clock className="w-4 h-4 text-accent flex-shrink-0"/><span>T2 – CN: 7:00 – 21:00</span></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-orange-200 font-[family-name:var(--font-body)]">
          <span>© 2025 DKS English Center. Bảo lưu mọi quyền.</span>
          <span>Thiết kế với ❤️ cho học viên Việt Nam</span>
        </div>
      </Container>
    </footer>
  );
}
