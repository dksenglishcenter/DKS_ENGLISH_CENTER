import Image from "next/image";

const DKS_LOGO_URL =
  "https://res.cloudinary.com/hw92uddx/image/upload/v1783836254/dks-english-center/brand/logo/bqf4dvjtxwqyd2whbdwh.png";

export function DKSLogo({
  size = "md",
  priority = false,
}: {
  size?: "sm" | "md" | "lg";
  priority?: boolean;
}) {
  const sizes = { sm: 40, md: 48, lg: 64 };
  const dimension = sizes[size];

  return (
    <span
      className="relative block flex-shrink-0"
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
