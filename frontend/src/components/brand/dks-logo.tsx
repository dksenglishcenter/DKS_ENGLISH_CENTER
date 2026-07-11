import Image from "next/image";

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
        src="/images/dks-logo.png"
        alt="DKS English Center"
        fill
        sizes={`${dimension}px`}
        className="scale-[1.65] object-contain"
        priority={priority}
      />
    </span>
  );
}
