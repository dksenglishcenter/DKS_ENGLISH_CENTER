import Image from "next/image";

import { cn } from "@/components/ui/utils";

export type SocialNetwork = "zalo" | "facebook" | "youtube" | "tiktok";

export function SocialIcon({
  network,
  className,
  variant = "monochrome",
}: {
  network: SocialNetwork;
  className?: string;
  variant?: "monochrome" | "brand";
}) {
  if (network === "zalo") {
    return (
      <Image
        src="/icons/zalo.svg"
        alt=""
        width={20}
        height={20}
        className={cn("h-5 w-5 flex-shrink-0", className)}
        unoptimized
      />
    );
  }

  if (network === "facebook") {
    return (
      <svg
        viewBox="0 0 24 24"
        className={cn("h-[18px] w-[18px]", className)}
        fill={variant === "brand" ? "#1877F2" : "currentColor"}
        aria-hidden="true"
      >
        <path d="M13.397 20.997v-8.196h2.765l.411-3.209h-3.176V7.548c0-.926.258-1.56 1.587-1.56h1.684V3.127A22.336 22.336 0 0 0 14.201 3c-2.444 0-4.122 1.492-4.122 4.231v2.355H7.332v3.209h2.753v8.202h3.312z" />
      </svg>
    );
  }

  if (network === "youtube") {
    return (
      <svg
        viewBox="0 0 24 24"
        className={cn("h-5 w-5", className)}
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M23.5 6.2a3.02 3.02 0 0 0-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.51A3.02 3.02 0 0 0 .5 6.2 31.6 31.6 0 0 0 0 12a31.6 31.6 0 0 0 .5 5.8 3.02 3.02 0 0 0 2.12 2.14c1.88.51 9.38.51 9.38.51s7.5 0 9.38-.51a3.02 3.02 0 0 0 2.12-2.14c.5-1.88.5-5.8.5-5.8s0-3.92-.5-5.8ZM9.6 15.6V8.4l6.24 3.6-6.24 3.6Z" />
      </svg>
    );
  }

  const tiktokPath =
    "M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z";

  return (
    <svg
      viewBox="0 0 24 24"
      className={cn("h-[18px] w-[18px]", className)}
      aria-hidden="true"
    >
      {variant === "brand" ? (
        <>
          <path d={tiktokPath} fill="#25F4EE" transform="translate(-0.45 -0.35)" />
          <path d={tiktokPath} fill="#FE2C55" transform="translate(0.45 0.35)" />
          <path d={tiktokPath} fill="white" />
        </>
      ) : (
        <path d={tiktokPath} fill="currentColor" />
      )}
    </svg>
  );
}
