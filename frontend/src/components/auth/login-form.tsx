"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Mail } from "lucide-react";

import { AuthInputField } from "@/components/auth/auth-input-field";
import { loginUser } from "@/lib/auth/api";
import { formatError } from "@/lib/errors/format-error";
import { PAGE_PATHS } from "@/lib/navigation-paths";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (loading) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await loginUser({
        email: email.trim(),
        password,
      });

      setSuccess(response.message);

      if (response.user.role === "ADMIN") {
        router.replace(PAGE_PATHS.admin);
      } else {
        router.replace(PAGE_PATHS.home);
      }
    } catch (err) {
      setError(formatError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate aria-busy={loading}>
      <AuthInputField
        label="Email"
        name="email"
        type="email"
        placeholder="your@email.com"
        icon={Mail}
        value={email}
        onChange={setEmail}
        autoComplete="email"
        required
      />
      <AuthInputField
        label="Mật khẩu"
        name="password"
        type="password"
        placeholder="••••••••"
        icon={Lock}
        value={password}
        onChange={setPassword}
        autoComplete="current-password"
        required
      />

      <div className="flex items-center justify-between">
        <label className="flex cursor-pointer items-center gap-2">
          <input type="checkbox" className="h-3.5 w-3.5 rounded accent-primary" />
          <span className="text-sm text-[#6B4226] font-[family-name:var(--font-body)]">
            Ghi nhớ đăng nhập
          </span>
        </label>
        <Link
          href={PAGE_PATHS.forgotPassword}
          className="text-sm font-semibold text-primary hover:underline font-[family-name:var(--font-body)]"
        >
          Quên mật khẩu?
        </Link>
      </div>

      {error ? (
        <p role="alert" className="rounded-[10px] border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      {success ? (
        <div
          role="status"
          className="rounded-[10px] bg-green-100 p-3 text-center text-sm font-semibold text-green-800 font-[family-name:var(--font-body)]"
        >
          {success}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-[12px] bg-primary py-3 font-bold text-white shadow-[0_4px_16px_rgba(241,101,34,0.35)] transition-all disabled:opacity-70 font-[family-name:var(--font-body)]"
      >
        {loading ? "Đang đăng nhập..." : "Đăng nhập"}
      </button>

      <div className="relative my-2 flex items-center gap-3">
        <div className="h-px flex-1 bg-[#F5EDE6]" />
        <span className="text-xs text-[#9B6B50] font-[family-name:var(--font-body)]">hoặc</span>
        <div className="h-px flex-1 bg-[#F5EDE6]" />
      </div>

      <button
        type="button"
        className="flex w-full items-center justify-center gap-2 rounded-[12px] border-[1.5px] border-[#F5EDE6] bg-white py-3 font-semibold text-[#4A2306] transition-all font-[family-name:var(--font-body)]"
      >
        <GoogleIcon />
        Tiếp tục với Google
      </button>

      <p className="text-center text-sm text-[#9B6B50] font-[family-name:var(--font-body)]">
        Chưa có tài khoản?{" "}
        <Link href={PAGE_PATHS.register} className="font-bold text-primary hover:underline">
          Đăng ký ngay
        </Link>
      </p>
    </form>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}
