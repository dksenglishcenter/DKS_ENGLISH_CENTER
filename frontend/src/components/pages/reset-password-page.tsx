"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock } from "lucide-react";

import { AuthInputField } from "@/components/auth/auth-input-field";
import { AuthShell } from "@/components/auth/auth-shell";
import { resetPassword } from "@/lib/auth/api";
import { formatError } from "@/lib/errors/format-error";
import { PAGE_PATHS } from "@/lib/navigation-paths";

export function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenFromQuery = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (loading) return;

    if (!tokenFromQuery) {
      setError("Thiếu token đặt lại mật khẩu.");
      return;
    }

    if (password !== confirm) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await resetPassword(tokenFromQuery, password);
      setSuccess(response.message);
      window.setTimeout(() => router.replace(PAGE_PATHS.login), 1200);
    } catch (err) {
      setError(formatError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      tab="login"
      title="Đặt lại mật khẩu"
      description="Nhập mật khẩu mới cho tài khoản của bạn"
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate aria-busy={loading}>
        <AuthInputField
          label="Mật khẩu mới"
          name="password"
          type="password"
          placeholder="Tối thiểu 8 ký tự, có chữ và số"
          icon={Lock}
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
          required
        />
        <AuthInputField
          label="Xác nhận mật khẩu"
          name="confirmPassword"
          type="password"
          placeholder="Nhập lại mật khẩu"
          icon={Lock}
          value={confirm}
          onChange={setConfirm}
          autoComplete="new-password"
          required
        />

        {error ? (
          <p role="alert" className="rounded-[10px] border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            {error}
          </p>
        ) : null}

        {success ? (
          <div role="status" className="rounded-[10px] bg-green-100 p-3 text-sm font-semibold text-green-800">
            {success}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={loading || !tokenFromQuery}
          className="w-full rounded-[12px] bg-primary py-3 font-bold text-white shadow-[0_4px_16px_rgba(241,101,34,0.35)] disabled:opacity-70"
        >
          {loading ? "Đang cập nhật..." : "Đặt lại mật khẩu"}
        </button>

        <p className="text-center text-sm text-[#9B6B50]">
          <Link href={PAGE_PATHS.login} className="font-bold text-primary hover:underline">
            Quay lại đăng nhập
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
