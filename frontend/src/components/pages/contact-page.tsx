import { Clock, FileText, Mail, MapPin, Phone } from "lucide-react";

import {
  SocialIcon,
  type SocialNetwork,
} from "@/components/brand/social-icon";
import { ContactForm } from "@/components/forms/contact-form";
import { Container } from "@/components/layout/container";
import { PageHero } from "@/components/layout/page-hero";
import type { ContactInformation } from "@/lib/contact/types";
import { getPhoneHref } from "@/lib/contact/validation";
import { SOCIAL_LINKS } from "@/lib/social-links";

const SOCIAL_CHANNELS = [
  { name: "Zalo", network: "zalo", href: SOCIAL_LINKS.zalo, className: "bg-[#0068FF]" },
  {
    name: "Facebook",
    network: "facebook",
    href: SOCIAL_LINKS.facebook,
    className: "bg-[#1877F2]",
  },
  {
    name: "YouTube",
    network: "youtube",
    href: SOCIAL_LINKS.youtube,
    className: "bg-[#B91C1C]"
  },
  {
    name: "TikTok",
    network: "tiktok",
    href: SOCIAL_LINKS.tiktok,
    className: "bg-[#1E1E1E]",
  },
] as const satisfies ReadonlyArray<{
  name: string;
  network: SocialNetwork;
  href: string;
  className: string;
}>;

export function ContactPage({
  contactInfo,
  courseOptions,
}: {
  contactInfo: ContactInformation | null;
  courseOptions: string[];
}) {
  const mapHref = contactInfo?.mapUrl;
  const contactDetails = contactInfo
    ? [
        {
          label: "Địa chỉ",
          value: contactInfo.address,
          icon: MapPin,
          href: mapHref,
        },
        {
          label: "Hotline",
          value: contactInfo.phone,
          icon: Phone,
          href: getPhoneHref(contactInfo.phone),
        },
        {
          label: "Email",
          value: contactInfo.email,
          icon: Mail,
          href: `mailto:${contactInfo.email}`,
        },
        {
          label: "Giờ mở cửa",
          value: contactInfo.hours,
          icon: Clock,
          href: undefined,
        },
      ]
    : [];

  return (
    <div className="bg-background">
      <PageHero
        label="Liên hệ"
        title={
          <>
            Chúng Tôi Sẵn Sàng
            <br />
            Hỗ Trợ Bạn
          </>
        }
        description="Đăng ký học thử hoặc nhận tư vấn miễn phí. Đội ngũ DKS sẽ liên hệ và xây dựng lộ trình phù hợp với mục tiêu của bạn"
      />

      <Container className="py-16 md:py-20">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-14">
          <section aria-labelledby="contact-information-title" className="space-y-8">
            <div>
              <h2
                id="contact-information-title"
                className="mb-6 text-2xl font-black text-[#4A2306] font-[family-name:var(--font-nunito)]"
              >
                Thông Tin Liên Hệ
              </h2>
              <address className="space-y-4 not-italic">
                {contactDetails.map((detail) => {
                  const Icon = detail.icon;
                  const content = (
                    <>
                      <span className="mb-0.5 block text-xs font-bold uppercase tracking-wide text-muted-foreground">
                        {detail.label}
                      </span>
                      <span className="block text-sm font-medium leading-relaxed text-[#4A2306]">
                        {detail.value}
                      </span>
                    </>
                  );

                  return (
                    <div key={detail.label} className="flex items-start gap-4">
                      <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <div className="pt-0.5 font-[family-name:var(--font-body)]">
                        {detail.href ? (
                          <a
                            href={detail.href}
                            className="rounded-sm transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                            {...(detail.href.startsWith("http")
                              ? { target: "_blank", rel: "noreferrer" }
                              : {})}
                          >
                            {content}
                          </a>
                        ) : (
                          content
                        )}
                      </div>
                    </div>
                  );
                })}
                {!contactInfo ? (
                  <p className="rounded-xl border border-border bg-secondary p-4 text-sm text-muted-foreground">
                    Thông tin liên hệ đang được cập nhật. Vui lòng thử lại sau.
                  </p>
                ) : null}
              </address>
            </div>

            <div>
              <h3 className="mb-4 text-lg font-black text-[#4A2306] font-[family-name:var(--font-nunito)]">
                Mạng xã hội
              </h3>
              <ul
                className="flex flex-nowrap gap-1.5 sm:flex-wrap sm:gap-3"
                aria-label="Các kênh mạng xã hội của DKS"
              >
                {SOCIAL_CHANNELS.map((channel) => (
                  <li key={channel.name} className="min-w-0 flex-1 sm:flex-none">
                    <a
                      href={channel.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex min-h-11 w-full items-center justify-center gap-1 whitespace-nowrap rounded-xl px-1 py-2.5 text-[10px] font-semibold text-white shadow-sm transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 motion-reduce:transform-none sm:w-auto sm:gap-2 sm:px-4 sm:text-sm ${channel.className}`}
                    >
                      <SocialIcon network={channel.network} className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      {channel.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative min-h-[280px] overflow-hidden rounded-2xl border border-border bg-[#F8F9FA]">
              <svg
                className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.06]"
                viewBox="0 0 400 280"
                aria-hidden="true"
              >
                {Array.from({ length: 10 }).map((_, index) => (
                  <line
                    key={`vertical-${index}`}
                    x1={index * 44}
                    y1="0"
                    x2={index * 44}
                    y2="280"
                    stroke="currentColor"
                  />
                ))}
                {Array.from({ length: 8 }).map((_, index) => (
                  <line
                    key={`horizontal-${index}`}
                    x1="0"
                    y1={index * 40}
                    x2="400"
                    y2={index * 40}
                    stroke="currentColor"
                  />
                ))}
              </svg>
              <div className="relative flex min-h-[280px] flex-col items-center justify-center gap-4 px-6 text-center">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-[#D95518] text-white shadow-xl shadow-primary/20">
                  <MapPin className="h-7 w-7" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="mb-1 font-black text-[#4A2306] font-[family-name:var(--font-nunito)]">
                    DKS English Center
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {contactInfo?.address ?? "Thông tin bản đồ đang được cập nhật"}
                  </p>
                  {mapHref ? (
                    <a
                      href={mapHref}
                      target="_blank"
                      rel="noreferrer"
                      className="pointer-events-auto mt-3 inline-flex min-h-11 items-center rounded-lg px-2 text-sm font-semibold text-primary underline underline-offset-4 transition-colors hover:text-[#D95518] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      Mở Google Maps →
                    </a>
                  ) : null}
                </div>
              </div>
            </div>
          </section>

          <section aria-labelledby="contact-form-title">
            <div className="rounded-2xl border border-border bg-white p-6 shadow-[0_4px_24px_rgba(74,35,6,0.06)] sm:p-8">
              <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <FileText className="h-6 w-6" aria-hidden="true" />
              </span>
              <h2
                id="contact-form-title"
                className="mb-1 text-xl font-black text-[#4A2306] font-[family-name:var(--font-nunito)]"
              >
                Nhận Tư Vấn Lộ Trình Học Phù Hợp
              </h2>
              <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
               Chúng tôi sẽ liên hệ trong thời gian sớm nhất để tư vấn khóa học phù hợp với trình độ và mục tiêu của bạn
              </p>
              <ContactForm courseOptions={courseOptions} />
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <a
                href={SOCIAL_LINKS.zalo}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-2xl border border-border bg-white p-5 text-center transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <span className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#E8F0FF]">
                  <SocialIcon network="zalo" className="h-5 w-5 text-[#0068FF]" />
                </span>
                <h3 className="mb-1 text-sm font-bold text-[#4A2306] font-[family-name:var(--font-nunito)]">
                  Chat Zalo
                </h3>
                <p className="text-xs text-muted-foreground">Phản hồi ngay lập tức</p>
              </a>
              <a
                href={contactInfo ? getPhoneHref(contactInfo.phone) : undefined}
                aria-disabled={!contactInfo}
                className="rounded-2xl border border-border bg-white p-5 text-center transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <span className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-secondary">
                  <Phone className="h-5 w-5 text-primary" aria-hidden="true" />
                </span>
                <span className="mb-1 block text-sm font-bold text-[#4A2306] font-[family-name:var(--font-nunito)]">
                  Gọi ngay
                </span>
                <span className="block text-xs text-muted-foreground">
                  {contactInfo?.phone ?? "Đang cập nhật"}
                </span>
              </a>
            </div>
          </section>
        </div>
      </Container>
    </div>
  );
}
