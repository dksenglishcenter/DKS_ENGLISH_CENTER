"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Menu, X } from "lucide-react";

import { DKSLogo } from "@/components/brand/dks-logo";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { PAGE_PATHS, type Page } from "@/lib/navigation";

export function Header({ active }: { active: Page }) {
  const [open, setOpen] = useState(false);
  const links: { label: string; page: Page }[] = [
    { label: "Trang chủ", page: "home" },
    { label: "Khóa học", page: "courses" },
    { label: "Về chúng tôi", page: "about" },
    { label: "Blog", page: "blog" },
    { label: "Tuyển dụng", page: "careers" },
    { label: "Liên hệ", page: "contact" },
  ];
  const linkClass = (page: Page) =>
    `px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150 font-[family-name:var(--font-nunito)] ${
      active === page
        ? "bg-secondary text-primary"
        : "text-[#4A2306] hover:bg-secondary hover:text-primary"
    }`;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-border shadow-sm">
      <Container>
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link href={PAGE_PATHS.home} className="flex-shrink-0" onClick={() => setOpen(false)}>
            <DKSLogo size="md" />
          </Link>

          <nav className="hidden lg:flex items-center gap-1" aria-label="Điều hướng chính">
            {links.map((l) => (
              <Link key={l.page} href={PAGE_PATHS[l.page]} className={linkClass(l.page)}>
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="hidden lg:block">
            <Button asChild size="md">
              <Link href={PAGE_PATHS.contact}>
                Đăng ký học thử <ArrowRight className="w-4 h-4"/>
              </Link>
            </Button>
          </div>

          <button
            type="button"
            className="lg:hidden p-2 rounded-lg text-[#4A2306] hover:bg-secondary transition-colors"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-label={open ? "Đóng menu" : "Mở menu"}
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </Container>

      {open && (
        <div className="lg:hidden border-t border-border bg-white">
          <Container className="py-4 flex flex-col gap-1">
            {links.map((l) => (
              <Link
                key={l.page}
                href={PAGE_PATHS[l.page]}
                onClick={() => setOpen(false)}
                className={`w-full text-left px-4 py-3 rounded-lg font-semibold transition-all font-[family-name:var(--font-nunito)] ${
                  active === l.page ? "bg-secondary text-primary" : "text-[#4A2306] hover:bg-secondary"
                }`}
              >
                {l.label}
              </Link>
            ))}
            <div className="pt-2">
              <Button asChild className="w-full justify-center">
                <Link href={PAGE_PATHS.contact} onClick={() => setOpen(false)}>
                  Đăng ký học thử <ArrowRight className="w-4 h-4"/>
                </Link>
              </Button>
            </div>
          </Container>
        </div>
      )}
    </header>
  );
}
