import { Phone } from "lucide-react";

import { SocialIcon } from "@/components/brand/social-icon";
import { SOCIAL_LINKS } from "@/lib/social-links";

const widgetClass =
  "flex h-11 w-11 items-center justify-center rounded-full shadow-lg transition-transform duration-200 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 active:scale-95 motion-reduce:transform-none";

export function FloatingWidgets() {
  return (
    <div className="fixed bottom-6 right-4 z-50 flex flex-col gap-3" aria-label="Liên hệ nhanh">
      <a
        href={SOCIAL_LINKS.zalo}
        target="_blank"
        rel="noopener noreferrer"
        title="Zalo"
        aria-label="Mở Zalo"
        className={`${widgetClass} bg-[#0068FF] text-white`}
      >
        <SocialIcon network="zalo" />
      </a>
      <a
        href={SOCIAL_LINKS.facebook}
        target="_blank"
        rel="noopener noreferrer"
        title="Facebook"
        aria-label="Mở Facebook của DKS English Center"
        className={`${widgetClass} bg-[#1877F2] text-white`}
      >
        <SocialIcon network="facebook" />
      </a>
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
