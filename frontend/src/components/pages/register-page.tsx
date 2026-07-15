import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterForm } from "@/components/auth/register-form";

export function RegisterPage() {
  return (
    <AuthShell
      tab="register"
      title="Tạo tài khoản mới"
      description="Đăng ký để bắt đầu hành trình học tiếng Anh"
    >
      <RegisterForm />
    </AuthShell>
  );
}
