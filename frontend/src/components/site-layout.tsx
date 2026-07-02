"use client";

import { Footer } from "@/components/layout/footer";
import { FloatingWidgets } from "@/components/layout/floating-widgets";
import { Header } from "@/components/layout/header";
import { useDksNavigation } from "@/lib/navigation";

export function SiteLayout({ children }: { children: React.ReactNode }) {
  const { activePage } = useDksNavigation();

  return (
    <div className="min-h-screen bg-background font-[family-name:var(--font-body)]">
      <Header active={activePage} />
      <main>{children}</main>
      <Footer />
      <FloatingWidgets />
    </div>
  );
}
