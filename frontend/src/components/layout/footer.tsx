import Link from "next/link";
import { Clock, Mail, MapPin, Phone } from "lucide-react";

import { DKSLogo } from "@/components/brand/dks-logo";
import { SocialIcon } from "@/components/brand/social-icon";
import { Container } from "@/components/layout/container";
import { PAGE_PATHS } from "@/lib/navigation-paths";
import { SOCIAL_LINKS } from "@/lib/social-links";

const COURSE_LINKS = [
  { label: "IELTS Preparation", href: `${PAGE_PATHS.courses}#ielts` },
  { label: "9-to-10 Prep", href: `${PAGE_PATHS.courses}#highschool` },
  { label: "Communicative English", href: `${PAGE_PATHS.courses}#comm` },
  { label: "1-on-1 Tutoring", href: `${PAGE_PATHS.courses}#tutoring` },
] as const;

const SOCIALS = [
  { label: "Zalo", network: "zalo", href: SOCIAL_LINKS.zalo },
  { label: "Facebook", network: "facebook", href: SOCIAL_LINKS.facebook },
  { label: "TikTok", network: "tiktok", href: SOCIAL_LINKS.tiktok },
] as const;

const footerLinkClass =
  "rounded-sm transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

export function Footer() {
  return (
    <footer
      id="site-footer"
      className="bg-[#4A2306] text-white font-[family-name:var(--font-body)]"
    >
      <Container className="py-14">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <div className="mb-4 flex items-center gap-3">
              <DKSLogo size="sm" />
              <div>
                <div className="text-lg font-black text-white font-[family-name:var(--font-heading)]">
                  DKS English Center
                </div>
                <div className="text-sm text-orange-200">Học đúng cách – Tiến xa mỗi ngày</div>
              </div>
            </div>
            <p className="mb-4 max-w-xl text-sm font-normal leading-relaxed text-orange-100">
              Trung tâm tiếng Anh uy tín tại Hà Nội với phương pháp giảng dạy cá nhân hóa và đội ngũ giáo viên tận tâm.
            </p>
            <div className="flex gap-4" aria-label="Mạng xã hội của DKS">
              {SOCIALS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={social.label}
                  aria-label={`Mở ${social.label}`}
                  className="flex h-8 w-8 items-center justify-center rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <SocialIcon network={social.network} className="h-5" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h2 className="mb-4 text-base font-bold text-white font-[family-name:var(--font-heading)]">
              Khóa học
            </h2>
            <ul className="space-y-2 text-sm font-bold text-orange-100 font-[family-name:var(--font-heading)]">
              {COURSE_LINKS.map((course) => (
                <li key={course.label}>
                  <Link href={course.href} className={footerLinkClass}>
                    {course.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="mb-4 text-base font-bold text-white font-[family-name:var(--font-heading)]">
              Liên hệ
            </h2>
            <address className="not-italic">
              <ul className="space-y-3 text-sm font-normal leading-relaxed text-orange-100">
                <li className="flex items-start gap-2.5">
                  <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" aria-hidden="true" />
                  <a
                    href="https://www.google.com/maps/search/?api=1&query=63%20Ng%C3%B5%20120%20D%C6%B0%C6%A1ng%20V%C4%83n%20B%C3%A9%2C%20V%C4%A9nh%20Tuy%2C%20Hai%20B%C3%A0%20Tr%C6%B0ng%2C%20H%C3%A0%20N%E1%BB%99i"
                    target="_blank"
                    rel="noreferrer"
                    className={footerLinkClass}
                  >
                    63 Ngõ 120 Dương Văn Bé, Vĩnh Tuy, Hai Bà Trưng, Hà Nội
                  </a>
                </li>
                <li className="flex items-center gap-2.5">
                  <Phone className="h-4 w-4 flex-shrink-0 text-primary" aria-hidden="true" />
                  <a href="tel:0834513456" className={footerLinkClass}>083 451 3456</a>
                </li>
                <li className="flex items-center gap-2.5">
                  <Mail className="h-4 w-4 flex-shrink-0 text-primary" aria-hidden="true" />
                  <a href="mailto:dksenglishcenter@gmail.com" className={footerLinkClass}>
                    dksenglishcenter@gmail.com
                  </a>
                </li>
                <li className="flex items-center gap-2.5">
                  <Clock className="h-4 w-4 flex-shrink-0 text-primary" aria-hidden="true" />
                  <span>T2 – CN: 7:00 – 21:00</span>
                </li>
              </ul>
            </address>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs font-normal text-orange-200 sm:flex-row">
          <span>© 2025 DKS English Center. Bảo lưu mọi quyền.</span>
          <span>Thiết kế với tình yêu dành cho học viên Việt Nam</span>
        </div>
      </Container>
    </footer>
  );
}
