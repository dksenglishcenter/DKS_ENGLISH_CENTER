import { Footer } from "@/components/layout/footer";
import { FloatingWidgets } from "@/components/layout/floating-widgets";
import { Header } from "@/components/layout/header";

export function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background font-[family-name:var(--font-body)]">
      <Header />
      <main>{children}</main>
      <Footer />
      <FloatingWidgets />
    </div>
  );
}
