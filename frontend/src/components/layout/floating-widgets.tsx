"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Phone } from "lucide-react";

import { SocialIcon } from "@/components/brand/social-icon";
import { getCurrentUser, logoutUser } from "@/lib/auth/api";
import type { AuthUser } from "@/lib/auth/types";
import { PAGE_PATHS } from "@/lib/navigation-paths";
import { SOCIAL_LINKS } from "@/lib/social-links";

const widgetClass =
  "flex h-11 w-11 items-center justify-center rounded-full shadow-lg transition-transform duration-200 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 active:scale-95 motion-reduce:transform-none";

const pillClass =
  "inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold shadow-lg transition-transform duration-200 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 active:scale-95 motion-reduce:transform-none font-[family-name:var(--font-nunito)]";

function FloatingAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const response = await getCurrentUser();
        if (!cancelled) setUser(response.user);
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logoutUser();
    } finally {
      setUser(null);
      setLoggingOut(false);
    }
  };

  if (!ready) {
    return (
      <div
        className="h-11 w-28 rounded-full bg-primary/70 shadow-lg"
        aria-hidden="true"
      />
    );
  }

  if (!user) {
    return (
      <Link href={PAGE_PATHS.login} className={`${pillClass} bg-primary text-white`}>
        Đăng nhập
      </Link>
    );
  }

  const initial = user.fullName.trim().charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase();

  return (
    <div className="flex flex-col items-start gap-2">
      <div
        className={`${pillClass} bg-primary text-white`}
        title={user.email}
      >
        <span
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#4A2306] text-xs font-black text-white"
          aria-hidden="true"
        >
          {initial}
        </span>
        <span className="max-w-[9.5rem] truncate">{user.fullName}</span>
      </div>
      <button
        type="button"
        onClick={handleLogout}
        disabled={loggingOut}
        className={`${pillClass} border border-border bg-[#4A2306] text-white disabled:opacity-70`}
      >
        {loggingOut ? "Đang thoát..." : "Đăng xuất"}
      </button>
    </div>
  );
}

export function FloatingWidgets() {
  return (
    <>
      <div className="fixed bottom-6 left-4 z-50">
        <FloatingAuth />
      </div>

      <div className="fixed bottom-6 right-4 z-50 flex flex-col gap-3" aria-label="Liên hệ nhanh">
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
          className={`${widgetClass} bg-primary text-white`}
        >
          <Phone className="h-5 w-5" aria-hidden="true" />
        </a>
      </div>
    </>
  );
}
