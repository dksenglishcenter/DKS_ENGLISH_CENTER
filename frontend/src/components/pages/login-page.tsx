import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";

export function LoginPage() {
  return (
    <AuthShell
      tab="login"
      title="Chào mừng trở lại!"
      description="Đăng nhập để truy cập tài liệu và khóa học của bạn"
    >
      <LoginForm />
    </AuthShell>
  );
}
