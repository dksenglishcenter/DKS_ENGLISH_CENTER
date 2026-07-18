import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Container } from "@/components/layout/container";
import { SectionLabel } from "@/components/layout/section-heading";
import { Reveal } from "@/components/motion/reveal";

export function PageHero({
  label,
  title,
  description,
  icon,
}: {
  label: string;
  title: ReactNode;
  description: string;
  icon?: LucideIcon;
}) {
  return (
    <div
      className="relative overflow-hidden py-16 md:py-20"
      style={{ background: "var(--hero-gradient)" }}
    >
      <Container className="relative text-center">
        <Reveal>
          <SectionLabel icon={icon}>{label}</SectionLabel>
          <h1 className="mb-4 text-4xl font-black text-foreground md:text-5xl font-[family-name:var(--font-nunito)]">
            {title}
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground font-[family-name:var(--font-body)]">
            {description}
          </p>
        </Reveal>
      </Container>
    </div>
  );
}
