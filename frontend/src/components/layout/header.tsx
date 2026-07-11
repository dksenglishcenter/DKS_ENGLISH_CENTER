"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Menu, X } from "lucide-react";

import { usePathname } from "next/navigation";

import { DKSLogo } from "@/components/brand/dks-logo";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { getActivePage, PAGE_PATHS, type Page } from "@/lib/navigation-paths";

export function Header() {
  const pathname = usePathname();
  const active = getActivePage(pathname);
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
    `rounded-[10px] px-4 py-2.5 text-[15px] font-semibold transition-all duration-150 font-[family-name:var(--font-body)] ${
      active === page
        ? "bg-primary/10 text-primary"
        : "text-[#4A4A4A] hover:bg-secondary hover:text-primary"
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-white/[0.97] shadow-[0_1px_10px_rgba(0,0,0,0.05)] backdrop-blur-md">
      <Container>
        <div className="flex h-16 items-center justify-between md:h-[72px]">
          <Link
            href={PAGE_PATHS.home}
            className="flex-shrink-0 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            onClick={() => setOpen(false)}
          >
            <DKSLogo size="md" priority />
          </Link>

          <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Điều hướng chính">
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
            className="min-h-11 min-w-11 rounded-[10px] p-2 text-[#4A4A4A] transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary lg:hidden"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-label={open ? "Đóng menu" : "Mở menu"}
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </Container>

      {open && (
        <div className="border-t border-border bg-white lg:hidden">
          <Container className="flex flex-col gap-1 py-4">
            {links.map((l) => (
              <Link
                key={l.page}
                href={PAGE_PATHS[l.page]}
                onClick={() => setOpen(false)}
                className={`w-full rounded-[10px] px-4 py-3 text-left font-semibold transition-all font-[family-name:var(--font-body)] ${
                  active === l.page ? "bg-secondary text-primary" : "text-[#1E1E1E] hover:bg-muted"
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
