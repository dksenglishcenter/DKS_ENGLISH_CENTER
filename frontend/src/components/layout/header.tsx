"use client";

import { useState } from "react";
import { ArrowRight, Menu, X } from "lucide-react";

import { DKSLogo } from "@/components/brand/dks-logo";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import type { Page, SetPage } from "@/lib/navigation";

export function Header({ active, setPage }: { active: Page; setPage: SetPage }) {
  const [open, setOpen] = useState(false);
  const links: { label: string; page: Page }[] = [
    { label: "Trang chủ", page: "home" },
    { label: "Khóa học", page: "courses" },
    { label: "Về chúng tôi", page: "about" },
    { label: "Blog", page: "blog" },
    { label: "Tuyển dụng", page: "careers" },
    { label: "Liên hệ", page: "contact" },
  ];
  const go = (p: Page) => {
    setPage(p);
    setOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-border shadow-sm">
      <Container>
        <div className="flex items-center justify-between h-16 md:h-20">
          <button onClick={() => go("home")} className="flex-shrink-0">
            <DKSLogo size="md" />
          </button>

          <nav className="hidden lg:flex items-center gap-1">
            {links.map((l) => (
              <button
                key={l.page}
                onClick={() => go(l.page)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150 font-[family-name:var(--font-nunito)] ${
                  active === l.page
                    ? "bg-secondary text-primary"
                    : "text-[#4A2306] hover:bg-secondary hover:text-primary"
                }`}
              >
                {l.label}
              </button>
            ))}
          </nav>

          <div className="hidden lg:block">
            <Button onClick={() => go("contact")} size="md">
              Đăng ký học thử <ArrowRight className="w-4 h-4"/>
            </Button>
          </div>

          <button
            className="lg:hidden p-2 rounded-lg text-[#4A2306] hover:bg-secondary transition-colors"
            onClick={() => setOpen(!open)}
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </Container>

      {open && (
        <div className="lg:hidden border-t border-border bg-white">
          <Container className="py-4 flex flex-col gap-1">
            {links.map((l) => (
              <button
                key={l.page}
                onClick={() => go(l.page)}
                className={`w-full text-left px-4 py-3 rounded-lg font-semibold transition-all font-[family-name:var(--font-nunito)] ${
                  active === l.page ? "bg-secondary text-primary" : "text-[#4A2306] hover:bg-secondary"
                }`}
              >
                {l.label}
              </button>
            ))}
            <div className="pt-2">
              <Button onClick={() => go("contact")} className="w-full justify-center">
                Đăng ký học thử <ArrowRight className="w-4 h-4"/>
              </Button>
            </div>
          </Container>
        </div>
      )}
    </header>
  );
}
