"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Phone } from "lucide-react";

import { useAuthSession } from "@/components/auth/auth-session";
import { SocialIcon } from "@/components/brand/social-icon";
import { PAGE_PATHS } from "@/lib/navigation-paths";
import { SOCIAL_LINKS } from "@/lib/social-links";

const widgetClass =
  "flex h-11 w-11 items-center justify-center rounded-full shadow-lg transition-transform duration-200 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 active:scale-95 motion-reduce:transform-none";

const pillClass =
  "inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold shadow-lg transition-transform duration-200 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 active:scale-95 motion-reduce:transform-none font-[family-name:var(--font-nunito)]";

function FloatingAuth() {
  const { user, ready, logout, loggingOut } = useAuthSession();

  if (!ready) {
    return (
      <div className="h-11 w-28 rounded-full bg-primary/70 shadow-lg" aria-hidden="true" />
    );
  }

  if (!user) {
    return (
      <Link href={PAGE_PATHS.login} className={`${pillClass} bg-primary text-primary-foreground`}>
        Đăng nhập
      </Link>
    );
  }

  const initial =
    user.fullName.trim().charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase();
  const isAdmin = user.role === "ADMIN";
  const accountHref = isAdmin ? PAGE_PATHS.admin : PAGE_PATHS.home;

  return (
    <div className="flex flex-col items-start gap-2">
      <Link
        href={accountHref}
        className={`${pillClass} bg-primary text-primary-foreground`}
        title={isAdmin ? `Vào trang admin · ${user.email}` : user.email}
        aria-label={isAdmin ? "Vào trang quản trị" : `Tài khoản ${user.fullName}`}
      >
        <span
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#4A2306] text-xs font-black text-white"
          aria-hidden="true"
        >
          {initial}
        </span>
        <span className="max-w-[9.5rem] truncate">{user.fullName}</span>
      </Link>
      <button
        type="button"
        onClick={() => void logout()}
        disabled={loggingOut}
        className="inline-flex items-center justify-center rounded-full bg-[#4A2306] px-4 py-2.5 text-sm font-bold text-white shadow-lg transition-transform duration-200 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 active:scale-95 disabled:opacity-70 motion-reduce:transform-none font-[family-name:var(--font-nunito)]"
      >
        {loggingOut ? "Đang thoát..." : "Đăng xuất"}
      </button>
    </div>
  );
}

function FloatingWidgetsContent() {
  return (
    <>
      <div className="pointer-events-auto fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] left-4 z-[100] animate-hero-enter">
        <FloatingAuth />
      </div>

      <div
        className="pointer-events-auto fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-4 z-[100] flex flex-col gap-3 animate-hero-enter"
        style={{ animationDelay: "120ms" }}
        aria-label="Liên hệ nhanh"
      >
        <a
          href={SOCIAL_LINKS.zalo}
          target="_blank"
          rel="noopener noreferrer"
          title="Zalo"
          aria-label="Mở Zalo"
          className={`${widgetClass} bg-[#0068FF] text-white`}
        >
          <SocialIcon network="zalo" />
        </a>
        <a
          href={SOCIAL_LINKS.facebook}
          target="_blank"
          rel="noopener noreferrer"
          title="Facebook"
          aria-label="Mở Facebook của DKS English Center"
          className={`${widgetClass} bg-[#1877F2] text-white`}
        >
          <SocialIcon network="facebook" />
        </a>
        <a
          href="tel:0834513456"
          title="Gọi ngay"
          aria-label="Gọi ngay 083 451 3456"
          className={`${widgetClass} bg-primary text-primary-foreground`}
        >
          <Phone className="h-5 w-5" aria-hidden="true" />
        </a>
      </div>
    </>
  );
}

export function FloatingWidgets() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(<FloatingWidgetsContent />, document.body);
}
