import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { DKSLogo } from "@/components/brand/dks-logo";
import { PAGE_PATHS } from "@/lib/navigation-paths";
import { cn } from "@/components/ui/utils";

const HIGHLIGHTS = [
  { emoji: "🎯", text: "Lộ trình cá nhân hóa cho từng học viên" },
  { emoji: "👨‍🏫", text: "Giáo viên bản ngữ và chuyên gia IELTS" },
  { emoji: "📱", text: "Học online linh hoạt mọi lúc mọi nơi" },
] as const;

const STORIES = [
  { name: "Minh A.", score: "IELTS 8.0", color: "#F16522" },
  { name: "Thu H.", score: "IELTS 7.5", color: "#FFA200" },
  { name: "Hùng N.", score: "IELTS 7.0", color: "#E85D26" },
] as const;

type AuthShellProps = {
  tab: "login" | "register";
  title: string;
  description: string;
  children: React.ReactNode;
};

export function AuthShell({ tab, title, description, children }: AuthShellProps) {
  return (
    <div className="flex min-h-screen bg-input-background font-[family-name:var(--font-body)]">
      <aside className="relative hidden w-[480px] flex-shrink-0 flex-col justify-between overflow-hidden bg-[linear-gradient(145deg,#4A2306_0%,#7A3A10_50%,#F16522_100%)] lg:flex">
        <div className="pointer-events-none absolute inset-0 opacity-10" aria-hidden="true">
          <div className="absolute left-10 top-20 h-40 w-40 rounded-full border-2 border-white" />
          <div className="absolute right-10 top-40 h-24 w-24 rounded-full border border-white" />
          <div className="absolute bottom-32 left-20 h-56 w-56 rounded-full border border-white" />
          <div className="absolute bottom-16 right-16 h-32 w-32 rounded-full border-2 border-white" />
        </div>

        <div className="relative p-10">
          <Link href={PAGE_PATHS.home} className="inline-flex items-center gap-3">
            {/* Logo Cloudinary — nền trong suốt, không bọc ô trắng */}
            <DKSLogo size="md" priority />
            <span className="text-xl font-black text-white font-[family-name:var(--font-nunito)]">
              DKS English Center
            </span>
          </Link>
        </div>

        <div className="relative p-10">
          <div className="mb-8 text-white">
            <h2 className="mb-4 text-3xl font-black leading-tight font-[family-name:var(--font-nunito)]">
              Mở ra cơ hội
              <br />
              với tiếng Anh
            </h2>
            <p className="leading-relaxed text-white/70">
              Tham gia cùng hơn 5,000 học viên đang chinh phục tiếng Anh mỗi ngày cùng DKS English
              Center.
            </p>
          </div>
          <div className="space-y-3">
            {HIGHLIGHTS.map((item) => (
              <div
                key={item.text}
                className="flex items-center gap-3 rounded-[12px] bg-white/10 px-4 py-3"
              >
                <span className="text-xl" aria-hidden="true">
                  {item.emoji}
                </span>
                <span className="text-sm text-white">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative p-10 pt-0">
          <div className="flex gap-3">
            {STORIES.map((story) => (
              <div key={story.name} className="flex-1 rounded-[12px] bg-white/10 p-3 text-center">
                <div
                  className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{ background: story.color }}
                >
                  {story.name[0]}
                </div>
                <div className="text-xs font-bold text-white font-[family-name:var(--font-nunito)]">
                  {story.score}
                </div>
                <div className="text-xs text-white/60">{story.name}</div>
              </div>
            ))}
          </div>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <div className="p-6">
          <Link
            href={PAGE_PATHS.home}
            className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" /> Về trang chủ
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center px-6 pb-10">
          <div className="w-full max-w-md">
            <div className="mb-8 flex items-center gap-2 lg:hidden">
              <DKSLogo size="sm" priority />
              <span className="font-black text-foreground font-[family-name:var(--font-nunito)]">
                DKS English Center
              </span>
            </div>

            <div className="mb-6">
              <h1 className="mb-1 text-2xl font-black text-foreground font-[family-name:var(--font-nunito)]">
                {title}
              </h1>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>

            <div className="mb-6 flex rounded-[12px] bg-[#F5EDE6] p-1">
              <Link
                href={PAGE_PATHS.login}
                className={cn(
                  "flex-1 rounded-[10px] py-2.5 text-center text-sm font-bold transition-all",
                  tab === "login"
                    ? "bg-card text-primary shadow-[0_1px_4px_rgba(0,0,0,0.08)]"
                    : "text-muted-foreground hover:text-primary",
                )}
              >
                Đăng nhập
              </Link>
              <Link
                href={PAGE_PATHS.register}
                className={cn(
                  "flex-1 rounded-[10px] py-2.5 text-center text-sm font-bold transition-all",
                  tab === "register"
                    ? "bg-card text-primary shadow-[0_1px_4px_rgba(0,0,0,0.08)]"
                    : "text-muted-foreground hover:text-primary",
                )}
              >
                Đăng ký
              </Link>
            </div>

            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
