"use client";

import { Footer } from "@/components/layout/footer";
import { FloatingWidgets } from "@/components/layout/floating-widgets";
import { Header } from "@/components/layout/header";
import { useDksNavigation } from "@/lib/navigation";

export function SiteLayout({ children }: { children: React.ReactNode }) {
  const { activePage, setPage } = useDksNavigation();

  return (
    <div className="min-h-screen bg-background font-[family-name:var(--font-body)]">
      <Header active={activePage} setPage={setPage} />
      <main>{children}</main>
      <Footer setPage={setPage} />
      <FloatingWidgets />
    </div>
  );
}
