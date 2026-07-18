import Image from "next/image";

import { cn } from "@/components/ui/utils";

/** Local high-res asset (2048²) — sharper than remote Cloudinary thumb. */
const DKS_LOGO_SRC = "/images/dks-logo.png";

const SIZE_MAP = {
  sm: { box: 40, img: 120 },
  md: { box: 48, img: 144 },
  lg: { box: 64, img: 192 },
} as const;

export function DKSLogo({
  size = "md",
  priority = false,
  className,
  withWordmark = false,
}: {
  size?: "sm" | "md" | "lg";
  priority?: boolean;
  className?: string;
  /** HTML wordmark — readable in dark mode (PNG text is dark brown). */
  withWordmark?: boolean;
}) {
  const { box, img } = SIZE_MAP[size];

  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span
        className="relative block flex-shrink-0 overflow-hidden"
        style={{ width: box, height: box }}
      >
        <Image
          src={DKS_LOGO_SRC}
          alt={withWordmark ? "" : "DKS English Center"}
          width={img}
          height={img}
          sizes={`${box * 2}px`}
          quality={95}
          priority={priority}
          className="h-full w-full scale-[1.35] object-cover object-[center_8%]"
          aria-hidden={withWordmark ? true : undefined}
        />
      </span>
      {withWordmark ? (
        <span className="flex min-w-0 flex-col leading-none">
          <span
            className={cn(
              "font-black tracking-tight text-foreground font-[family-name:var(--font-nunito)]",
              size === "sm" && "text-sm",
              size === "md" && "text-base",
              size === "lg" && "text-lg",
            )}
          >
            DKS
          </span>
          <span
            className={cn(
              "mt-0.5 font-semibold uppercase tracking-[0.14em] text-muted-foreground font-[family-name:var(--font-body)]",
              size === "sm" && "text-[8px]",
              size === "md" && "text-[9px]",
              size === "lg" && "text-[10px]",
            )}
          >
            English Center
          </span>
        </span>
      ) : null}
    </span>
  );
}
