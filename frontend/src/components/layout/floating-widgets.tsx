"use client";

import { Phone } from "lucide-react";
import { usePathname } from "next/navigation";

import { SocialIcon } from "@/components/brand/social-icon";
import { PAGE_PATHS } from "@/lib/navigation-paths";

const widgetClass =
  "flex h-11 w-11 items-center justify-center rounded-full shadow-lg transition-transform duration-200 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 active:scale-95 motion-reduce:transform-none";

export function FloatingWidgets() {
  const pathname = usePathname();

  if (pathname === PAGE_PATHS.contact) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-4 z-50 flex flex-col gap-3" aria-label="Liên hệ nhanh">
      <span
        title="Zalo"
        aria-label="Zalo"
        className={`${widgetClass} bg-[#0068FF] text-white`}
      >
        <SocialIcon network="zalo" />
      </span>
      <span
        title="Facebook"
        aria-label="Facebook"
        className={`${widgetClass} bg-[#1877F2] text-white`}
      >
        <SocialIcon network="facebook" />
      </span>
      <a
        href="tel:0834513456"
        title="Gọi ngay"
        aria-label="Gọi ngay 083 451 3456"
        className={`${widgetClass} bg-primary text-white`}
      >
        <Phone className="h-5 w-5" aria-hidden="true" />
      </a>
    </div>
  );
}
