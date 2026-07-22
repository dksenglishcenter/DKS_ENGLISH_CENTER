"use client";

import Link from "next/link";

import { AuthShell } from "@/components/auth/auth-shell";
import { PAGE_PATHS } from "@/lib/navigation-paths";
import { SOCIAL_LINKS } from "@/lib/social-links";

/** TODO(email): khôi phục form gọi forgotPassword API khi bật lại mail + reset-token. */
export function ForgotPasswordPage() {
  return (
    <AuthShell
      tab="login"
      title="Quên mật khẩu"
      description="Tính năng đặt lại mật khẩu qua email đang tạm khóa"
    >
      <div className="space-y-4">
        <div
          role="status"
          className="rounded-[10px] border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950"
        >
          <p className="font-semibold">Tạm thời chưa hỗ trợ quên mật khẩu qua email.</p>
          <p className="mt-2 font-normal text-amber-900/90">
            Vui lòng liên hệ trung tâm qua Zalo để được hỗ trợ đặt lại mật khẩu.
          </p>
          <p className="mt-3">
            <a
              href={SOCIAL_LINKS.zalo}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-primary underline"
            >
              Nhắn Zalo DKS English Center
            </a>
          </p>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          <Link href={PAGE_PATHS.login} className="font-bold text-primary hover:underline">
            Quay lại đăng nhập
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
