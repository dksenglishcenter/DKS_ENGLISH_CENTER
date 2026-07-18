import type { LucideIcon } from "lucide-react";

import { cn } from "@/components/ui/utils";

export function SectionLabel({
  children,
  icon: Icon,
}: {
  children: React.ReactNode;
  icon?: LucideIcon;
}) {
  return (
    <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-5 py-1.5 text-sm font-bold uppercase tracking-wide text-primary font-[family-name:var(--font-nunito)]">
      {Icon ? <Icon className="h-4 w-4" strokeWidth={2.25} aria-hidden="true" /> : null}
      {children}
    </div>
  );
}

export function SectionHeading({
  label,
  title,
  sub,
  titleId,
  icon,
}: {
  label: string;
  title: string;
  sub?: string;
  titleId?: string;
  icon?: LucideIcon;
}) {
  return (
    <div className="mb-14 text-center">
      <SectionLabel icon={icon}>{label}</SectionLabel>
      <h2
        id={titleId}
        className="mb-4 text-3xl font-black text-foreground md:text-4xl font-[family-name:var(--font-nunito)]"
      >
        {title}
      </h2>
      {sub ? (
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground font-[family-name:var(--font-body)]">
          {sub}
        </p>
      ) : null}
    </div>
  );
}

/** Soft floating icons for hero / section atmosphere — decorative only. */
export function FloatingAccentIcons({
  icons,
  className,
}: {
  icons: LucideIcon[];
  className?: string;
}) {
  const spots = [
    "left-[6%] top-[18%] animate-fox-float",
    "right-[8%] top-[28%] animate-fox-float [animation-delay:0.6s]",
    "left-[12%] bottom-[22%] animate-fox-float [animation-delay:1.1s]",
    "right-[14%] bottom-[16%] animate-fox-float [animation-delay:1.7s]",
  ];

  return (
    <div
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
      aria-hidden="true"
    >
      {icons.slice(0, 4).map((Icon, index) => (
        <span
          key={index}
          className={cn(
            "absolute flex h-10 w-10 items-center justify-center rounded-2xl border border-primary/15 bg-card/70 text-primary/45 shadow-sm backdrop-blur-[2px] dark:bg-card/40",
            spots[index],
          )}
        >
          <Icon className="h-5 w-5" strokeWidth={2} />
        </span>
      ))}
    </div>
  );
}
