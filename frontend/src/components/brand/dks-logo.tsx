import Image from "next/image";

import { cn } from "@/components/ui/utils";

const DKS_LOGO_URL =
  "https://res.cloudinary.com/hw92uddx/image/upload/v1783836254/dks-english-center/brand/logo/bqf4dvjtxwqyd2whbdwh.png";

export function DKSLogo({
  size = "md",
  priority = false,
  className,
}: {
  size?: "sm" | "md" | "lg";
  priority?: boolean;
  className?: string;
}) {
  const sizes = { sm: 40, md: 48, lg: 64 };
  const dimension = sizes[size];

  return (
    <span
      className={cn("relative block flex-shrink-0", className)}
      style={{ width: dimension, height: dimension }}
    >
      <Image
        src={DKS_LOGO_URL}
        alt="DKS English Center"
        fill
        sizes={`${dimension}px`}
        className="scale-[1.65] object-contain"
        priority={priority}
      />
    </span>
  );
}
