import { Suspense } from "react";

import { ResetPasswordPage } from "@/components/pages/reset-password-page";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata = createPageMetadata({
  title: "Đặt lại mật khẩu",
  description: "Nhập mật khẩu mới cho tài khoản DKS English Center.",
  path: "/reset-password",
  noIndex: true,
});

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FFF9F5]" />}>
      <ResetPasswordPage />
    </Suspense>
  );
}
