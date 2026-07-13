import Image from "next/image";

import { cn } from "@/components/ui/utils";
import type { SocialNetwork } from "@/lib/social-links";

export type { SocialNetwork } from "@/lib/social-links";

const SOCIAL_ICON_PATHS: Record<SocialNetwork, string> = {
  zalo: "/icons/zalo.svg",
  facebook: "/icons/facebook.svg",
  youtube: "/icons/youtube.svg",
  tiktok: "/icons/tiktok.svg",
};

export function SocialIcon({
  network,
  className,
}: {
  network: SocialNetwork;
  className?: string;
}) {
  return (
    <Image
      src={SOCIAL_ICON_PATHS[network]}
      alt=""
      width={20}
      height={20}
      className={cn("h-5 w-5 flex-shrink-0 object-contain", className)}
      unoptimized
    />
  );
}
