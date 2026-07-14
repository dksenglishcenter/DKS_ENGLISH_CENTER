import Link from "next/link";
import { Clock, Mail, MapPin, Phone } from "lucide-react";

import { DKSLogo } from "@/components/brand/dks-logo";
import { SocialIcon } from "@/components/brand/social-icon";
import { Container } from "@/components/layout/container";
import { PAGE_PATHS } from "@/lib/navigation-paths";
import { SOCIAL_LINKS } from "@/lib/social-links";
import type { SocialNetwork } from "@/lib/social-links";

const COURSE_LABELS = [
  "Luyện thi vào lớp 10",
  "Luyện thi THPT & Đại học",
  "IELTS 1:1",
  "Global Success lớp 1–9",
] as const;

const FOOTER_SOCIALS: { network: SocialNetwork; href: string; label: string }[] = [
  { network: "zalo", href: SOCIAL_LINKS.zalo, label: "Zalo" },
  { network: "facebook", href: SOCIAL_LINKS.facebook, label: "Facebook" },
  { network: "youtube", href: SOCIAL_LINKS.youtube, label: "YouTube" },
];

export function Footer() {
  return (
    <footer className="bg-[#4A2306] text-white">
      <Container className="py-14">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <div className="mb-4 flex items-center gap-3">
              <DKSLogo size="sm" />
              <div>
                <div className="text-lg font-black text-white font-[family-name:var(--font-nunito)]">
                  DKS English Center
                </div>
                <div className="text-sm text-orange-200 font-[family-name:var(--font-body)]">
                  Học đúng cách – Tiến xa mỗi ngày
                </div>
              </div>
            </div>
            <p className="mb-4 text-sm leading-relaxed text-orange-100 font-[family-name:var(--font-body)]">
              Trung tâm tiếng Anh hàng đầu tại TP. Hà Nội với phương pháp giảng dạy sáng tạo và đội
              ngũ giáo viên tận tâm.
            </p>
            <div className="flex gap-3" aria-label="Mạng xã hội của DKS">
              {FOOTER_SOCIALS.map((social) => (
                <a
                  key={social.network}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={social.label}
                  aria-label={`Mở ${social.label}`}
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-sm transition-colors hover:bg-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <SocialIcon network={social.network} className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-4 font-bold text-white font-[family-name:var(--font-nunito)]">Khóa học</h4>
            <ul className="space-y-2 text-sm text-orange-100 font-[family-name:var(--font-body)]">
              {COURSE_LABELS.map((course) => (
                <li key={course}>
                  <Link href={PAGE_PATHS.courses} className="transition-colors hover:text-accent">
                    {course}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-bold text-white font-[family-name:var(--font-nunito)]">Liên hệ</h4>
            <ul className="space-y-3 text-sm text-orange-100 font-[family-name:var(--font-body)]">
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent" aria-hidden="true" />
                <span>63 Ngõ 120 Dương Văn Bé, Vĩnh Tuy, Hai Bà Trưng, Hà Nội</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 flex-shrink-0 text-accent" aria-hidden="true" />
                <span>083 451 3456</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 flex-shrink-0 text-accent" aria-hidden="true" />
                <span>dksenglishcenter@gmail.com</span>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="h-4 w-4 flex-shrink-0 text-accent" aria-hidden="true" />
                <span>T2 – CN: 7:00 – 21:00</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-orange-200 sm:flex-row font-[family-name:var(--font-body)]">
          <span>© 2026 DKS English Center</span>
          <span>Đồng hành cùng bạn trên hành trình chinh phục tiếng Anh</span>
        </div>
      </Container>
    </footer>
  );
}
