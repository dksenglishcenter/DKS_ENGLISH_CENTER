import { ForgotPasswordPage } from "@/components/pages/forgot-password-page";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata = createPageMetadata({
  title: "Quên mật khẩu",
  description: "Đặt lại mật khẩu tài khoản DKS English Center.",
  path: "/forgot-password",
  noIndex: true,
});

export default function Page() {
  return <ForgotPasswordPage />;
}
