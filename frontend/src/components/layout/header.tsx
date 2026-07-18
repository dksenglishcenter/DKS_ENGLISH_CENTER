"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";

import { useAuthSession } from "@/components/auth/auth-session";
import { DKSLogo } from "@/components/brand/dks-logo";
import { Container } from "@/components/layout/container";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { getActivePage, PAGE_PATHS, type Page } from "@/lib/navigation-paths";

export function Header() {
  const pathname = usePathname();
  const active = getActivePage(pathname);
  const [open, setOpen] = useState(false);
  const { user, ready, logout, loggingOut } = useAuthSession();

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
        : "text-foreground hover:bg-secondary hover:text-primary"
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 shadow-sm backdrop-blur-md">
      <Container>
        <div className="flex h-16 items-center justify-between md:h-20">
          <Link
            href={PAGE_PATHS.home}
            className="flex-shrink-0"
            onClick={() => setOpen(false)}
            aria-label="DKS English Center — Trang chủ"
          >
            <DKSLogo size="md" priority withWordmark />
          </Link>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Điều hướng chính">
            {links.map((l) => (
              <Link key={l.page} href={PAGE_PATHS[l.page]} className={linkClass(l.page)}>
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            <ThemeToggle />
            <Button asChild size="md">
              <Link href={PAGE_PATHS.contact}>
                Đăng ký học thử <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="flex items-center gap-1 lg:hidden">
            <ThemeToggle />
            {ready && !user ? (
              <Link
                href={PAGE_PATHS.login}
                className="rounded-lg px-3 py-2 text-sm font-bold text-primary font-[family-name:var(--font-nunito)]"
              >
                Đăng nhập
              </Link>
            ) : null}
            {ready && user ? (
              <Link
                href={user.role === "ADMIN" ? PAGE_PATHS.admin : PAGE_PATHS.home}
                className="max-w-[7rem] truncate rounded-lg px-2 py-2 text-sm font-bold text-foreground font-[family-name:var(--font-nunito)]"
                title={user.role === "ADMIN" ? "Vào trang admin" : user.fullName}
              >
                {user.fullName}
              </Link>
            ) : null}
            <button
              type="button"
              className="rounded-lg p-2 text-foreground transition-colors hover:bg-secondary"
              onClick={() => setOpen(!open)}
              aria-expanded={open}
              aria-label={open ? "Đóng menu" : "Mở menu"}
            >
              {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </Container>

      {open && (
        <div className="border-t border-border bg-background lg:hidden">
          <Container className="flex flex-col gap-1 py-4">
            {links.map((l) => (
              <Link
                key={l.page}
                href={PAGE_PATHS[l.page]}
                onClick={() => setOpen(false)}
                className={`w-full rounded-lg px-4 py-3 text-left font-semibold transition-all font-[family-name:var(--font-nunito)] ${
                  active === l.page
                    ? "bg-secondary text-primary"
                    : "text-foreground hover:bg-secondary"
                }`}
              >
                {l.label}
              </Link>
            ))}
            <div className="space-y-2 pt-2">
              {user ? (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-center"
                  disabled={loggingOut}
                  onClick={() => {
                    void logout().then(() => setOpen(false));
                  }}
                >
                  {loggingOut ? "Đang thoát..." : "Đăng xuất"}
                </Button>
              ) : (
                <Button asChild variant="outline" className="w-full justify-center">
                  <Link href={PAGE_PATHS.login} onClick={() => setOpen(false)}>
                    Đăng nhập
                  </Link>
                </Button>
              )}
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
