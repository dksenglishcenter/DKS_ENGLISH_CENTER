"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BookOpen,
  Briefcase,
  Building2,
  ClipboardCheck,
  FileText,
  FileUser,
  GraduationCap,
  ImageIcon,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  MessageSquareQuote,
  Newspaper,
  School,
  Users,
  UsersRound,
  Wallet,
  X,
} from "lucide-react";

import { DKSLogo } from "@/components/brand/dks-logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { getCurrentUser, logoutUser } from "@/lib/auth/api";
import type { AuthUser } from "@/lib/auth/types";
import { PAGE_PATHS } from "@/lib/navigation-paths";
import { cn } from "@/components/ui/utils";

/**
 * TEMP: ẩn menu Giai đoạn 3 (chưa thanh toán) — display: none.
 * Xóa href khỏi set này khi khách thanh toán để hiện lại.
 */
const PHASE3_NAV_HIDDEN_HREFS = new Set([
  `${PAGE_PATHS.admin}/students`,
  `${PAGE_PATHS.admin}/classes`,
  `${PAGE_PATHS.admin}/attendance`,
  `${PAGE_PATHS.admin}/tuition`,
]);

const ADMIN_NAV = [
  { href: PAGE_PATHS.admin, label: "Tổng quan", icon: LayoutDashboard },
  { href: `${PAGE_PATHS.admin}/students`, label: "Học viên", icon: UsersRound },
  { href: `${PAGE_PATHS.admin}/classes`, label: "Lớp học", icon: School },
  { href: `${PAGE_PATHS.admin}/attendance`, label: "Điểm danh", icon: ClipboardCheck },
  { href: `${PAGE_PATHS.admin}/tuition`, label: "Học phí", icon: Wallet },
  { href: `${PAGE_PATHS.admin}/courses`, label: "Khóa học", icon: BookOpen },
  { href: `${PAGE_PATHS.admin}/exams`, label: "Đề thi thử", icon: FileText },
  {
    href: `${PAGE_PATHS.admin}/success-stories`,
    label: "Câu chuyện",
    icon: MessageSquareQuote,
  },
  {
    href: `${PAGE_PATHS.admin}/gallery`,
    label: "Môi trường Học Tập",
    icon: ImageIcon,
  },
  { href: `${PAGE_PATHS.admin}/about`, label: "Về chúng tôi", icon: Building2 },
  {
    href: `${PAGE_PATHS.admin}/teachers`,
    label: "Giáo viên",
    icon: GraduationCap,
  },
  { href: `${PAGE_PATHS.admin}/blog`, label: "Blog", icon: Newspaper },
  { href: `${PAGE_PATHS.admin}/contacts`, label: "Liên hệ", icon: Mail },
  { href: `${PAGE_PATHS.admin}/careers`, label: "Tuyển dụng", icon: Briefcase },
  {
    href: `${PAGE_PATHS.admin}/career-applications`,
    label: "Đơn ứng tuyển",
    icon: FileUser,
  },
  { href: `${PAGE_PATHS.admin}/users`, label: "Người dùng", icon: Users },
] as const;

const TEACHER_NAV = [
  { href: `${PAGE_PATHS.admin}/classes`, label: "Lớp của tôi", icon: School },
  { href: `${PAGE_PATHS.admin}/attendance`, label: "Điểm danh", icon: ClipboardCheck },
  { href: `${PAGE_PATHS.admin}/exams`, label: "Đề thi thử", icon: FileText },
] as const;

function teacherCanAccess(pathname: string) {
  return (
    pathname === `${PAGE_PATHS.admin}/classes` ||
    pathname.startsWith(`${PAGE_PATHS.admin}/classes/`) ||
    pathname === `${PAGE_PATHS.admin}/attendance` ||
    pathname.startsWith(`${PAGE_PATHS.admin}/attendance/`) ||
    pathname === `${PAGE_PATHS.admin}/exams` ||
    pathname.startsWith(`${PAGE_PATHS.admin}/exams/`)
  );
}

const AdminUserContext = createContext<AuthUser | null>(null);

/** User ADMIN/TEACHER đã được AdminShell xác thực — tránh gọi /auth/me lần nữa. */
export function useAdminUser() {
  const user = useContext(AdminUserContext);
  if (!user) {
    throw new Error("useAdminUser must be used within AdminShell");
  }
  return user;
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [checking, setChecking] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const response = await getCurrentUser();
        if (cancelled) return;

        const role = response.user.role;
        if (role === "PARENT") {
          router.replace(PAGE_PATHS.parent);
          return;
        }
        if (role !== "ADMIN" && role !== "TEACHER") {
          router.replace(PAGE_PATHS.home);
          return;
        }

        setUser(response.user);
      } catch {
        if (!cancelled) {
          router.replace(PAGE_PATHS.login);
        }
      } finally {
        if (!cancelled) setChecking(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  useEffect(() => {
    if (!user || user.role !== "TEACHER") return;
    if (!teacherCanAccess(pathname)) {
      router.replace(`${PAGE_PATHS.admin}/classes`);
    }
  }, [user, pathname, router]);

  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileSidebarOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileSidebarOpen(false);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileSidebarOpen]);

  const navItems = useMemo(
    () => (user?.role === "TEACHER" ? TEACHER_NAV : ADMIN_NAV),
    [user?.role],
  );

  const handleLogout = async () => {
    try {
      await logoutUser();
    } finally {
      router.replace(PAGE_PATHS.login);
    }
  };

  if (checking || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FFF9F5] text-sm text-[#9B6B50] dark:bg-background dark:text-muted-foreground">
        Đang kiểm tra phiên đăng nhập...
      </div>
    );
  }

  if (user.role === "TEACHER" && !teacherCanAccess(pathname)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FFF9F5] text-sm text-[#9B6B50] dark:bg-background dark:text-muted-foreground">
        Đang chuyển tới lớp của bạn...
      </div>
    );
  }

  const renderNavigation = (onNavigate?: () => void) =>
    navItems.map((item) => {
      const Icon = item.icon;
      const active =
        item.href === PAGE_PATHS.admin
          ? pathname === PAGE_PATHS.admin
          : pathname.startsWith(item.href);

      return (
        <Link
          key={item.href}
          href={item.href}
          onClick={onNavigate}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors",
            active
              ? "bg-primary text-white"
              : "text-white/75 hover:bg-white/10 hover:text-white",
          )}
          style={
            PHASE3_NAV_HIDDEN_HREFS.has(item.href)
              ? { display: "none" }
              : undefined
          }
        >
          <Icon className="h-4 w-4" />
          {item.label}
        </Link>
      );
    });

  const renderSidebarFooter = () => (
    <div className="border-t border-white/10 p-4">
      <div className="mb-3 text-xs text-white/70">
        <div className="font-semibold text-white">{user.fullName}</div>
        <div>{user.email}</div>
      </div>
      <button
        type="button"
        onClick={() => void handleLogout()}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm font-semibold hover:bg-white/15"
      >
        <LogOut className="h-4 w-4" />
        Đăng xuất
      </button>
    </div>
  );

  const brandTitle = user.role === "TEACHER" ? "DKS Giáo viên" : "DKS Admin";
  const brandSubtitle = user.role === "TEACHER" ? "Lớp & điểm danh" : "Quản trị hệ thống";

  return (
    <AdminUserContext.Provider value={user}>
      <div className="flex min-h-screen bg-[#FFF9F5] font-[family-name:var(--font-body)] text-[#4A2306] dark:bg-background dark:text-foreground">
        <aside className="sticky top-0 hidden h-screen w-64 flex-shrink-0 flex-col border-r border-border bg-[#4A2306] text-white dark:bg-[#121214] lg:flex">
          <div className="flex items-center gap-3 border-b border-white/10 px-5 py-5">
            <DKSLogo size="sm" />
            <div>
              <div className="text-sm font-black font-[family-name:var(--font-nunito)]">
                {brandTitle}
              </div>
              <div className="text-xs text-white/60">{brandSubtitle}</div>
            </div>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto p-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {renderNavigation()}
          </nav>

          {renderSidebarFooter()}
        </aside>

        {mobileSidebarOpen ? (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              aria-label="Đóng menu"
              className="absolute inset-0 bg-black/45"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <aside
              id="admin-mobile-sidebar"
              className="absolute inset-y-0 left-0 flex w-[min(20rem,86vw)] flex-col bg-[#4A2306] text-white shadow-xl dark:bg-[#121214]"
            >
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-4">
                <div className="flex items-center gap-3">
                  <DKSLogo size="sm" />
                  <div>
                    <div className="text-sm font-black font-[family-name:var(--font-nunito)]">
                      {brandTitle}
                    </div>
                    <div className="text-xs text-white/60">{brandSubtitle}</div>
                  </div>
                </div>
                <button
                  type="button"
                  aria-label="Đóng menu"
                  className="rounded-lg p-2 text-white/80 hover:bg-white/10"
                  onClick={() => setMobileSidebarOpen(false)}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="flex-1 space-y-1 overflow-y-auto p-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {renderNavigation(() => setMobileSidebarOpen(false))}
              </nav>

              {renderSidebarFooter()}
            </aside>
          </div>
        ) : null}

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center justify-between gap-3 border-b border-border bg-white px-4 py-3 sm:px-6 lg:px-8 dark:bg-card">
            <div className="flex min-w-0 items-center gap-2">
              <button
                type="button"
                className="rounded-lg border border-border p-2 text-[#4A2306] hover:bg-[#FFF9F5] lg:hidden dark:text-foreground dark:hover:bg-secondary"
                aria-label="Mở menu"
                aria-expanded={mobileSidebarOpen}
                aria-controls="admin-mobile-sidebar"
                onClick={() => setMobileSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </button>
              <h1 className="truncate text-lg font-black text-[#4A2306] font-[family-name:var(--font-nunito)] dark:text-foreground">
                Bảng điều khiển
              </h1>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <ThemeToggle />
              <Link
                href={PAGE_PATHS.home}
                className="text-sm font-semibold text-primary hover:underline"
              >
                Về website
              </Link>
            </div>
          </header>
          <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </AdminUserContext.Provider>
  );
}
