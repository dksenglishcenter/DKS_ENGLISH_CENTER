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
    `rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-150 font-[family-name:var(--font-nunito)] ${
      active === page
        ? "bg-secondary text-primary"
        : "text-[#4A2306] hover:bg-secondary hover:text-primary"
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-white/95 shadow-sm backdrop-blur-md">
      <Container>
        <div className="flex h-16 items-center justify-between md:h-20">
          <Link
            href={PAGE_PATHS.home}
            className="flex-shrink-0"
            onClick={() => setOpen(false)}
          >
            <DKSLogo size="md" priority />
          </Link>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Điều hướng chính">
            {links.map((l) => (
              <Link key={l.page} href={PAGE_PATHS[l.page]} className={linkClass(l.page)}>
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <Button asChild size="md">
              <Link href={PAGE_PATHS.contact}>
                Đăng ký học thử <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <button
            type="button"
            className="rounded-lg p-2 text-[#4A2306] transition-colors hover:bg-secondary lg:hidden"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-label={open ? "Đóng menu" : "Mở menu"}
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
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
                className={`w-full rounded-lg px-4 py-3 text-left font-semibold transition-all font-[family-name:var(--font-nunito)] ${
                  active === l.page
                    ? "bg-secondary text-primary"
                    : "text-[#4A2306] hover:bg-secondary"
                }`}
              >
                {l.label}
              </Link>
            ))}
            <div className="pt-2">
              <Button asChild className="w-full justify-center">
                <Link href={PAGE_PATHS.contact} onClick={() => setOpen(false)}>
                  Đăng ký học thử <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </Container>
        </div>
      )}
    </header>
  );
}
