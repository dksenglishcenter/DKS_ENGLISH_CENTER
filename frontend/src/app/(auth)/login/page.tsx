import { LoginPage } from "@/components/pages/login-page";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata = createPageMetadata({
  title: "Đăng nhập",
  description: "Đăng nhập tài khoản DKS English Center để truy cập khóa học và tài liệu học tập.",
  path: "/login",
  noIndex: true,
});

export default function Page() {
  return <LoginPage />;
}
