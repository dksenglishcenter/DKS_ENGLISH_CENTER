import { RegisterPage } from "@/components/pages/register-page";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata = createPageMetadata({
  title: "Đăng ký",
  description:
    "Đăng ký tài khoản DKS English Center để bắt đầu hành trình học tiếng Anh và truy cập khóa học.",
  path: "/register",
  noIndex: true,
});

export default function Page() {
  return <RegisterPage />;
}
