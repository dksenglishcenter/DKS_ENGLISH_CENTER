import type { ReactNode } from "react";

import { Container } from "@/components/layout/container";
import { SectionLabel } from "@/components/layout/section-heading";

export function PageHero({
  label,
  title,
  description,
}: {
  label: string;
  title: ReactNode;
  description: string;
}) {
  return (
    <div
      className="py-16 md:py-20"
      style={{ background: "linear-gradient(135deg, #FFF4EC 0%, #FFFBF0 100%)" }}
    >
      <Container className="text-center">
        <SectionLabel>{label}</SectionLabel>
        <h1 className="text-4xl md:text-5xl font-black text-[#4A2306] mb-4 font-[family-name:var(--font-nunito)]">
          {title}
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-[family-name:var(--font-body)]">
          {description}
        </p>
      </Container>
    </div>
  );
}
