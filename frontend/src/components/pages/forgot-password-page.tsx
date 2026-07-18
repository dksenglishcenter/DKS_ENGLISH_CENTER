"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";

import { AuthInputField } from "@/components/auth/auth-input-field";
import { AuthShell } from "@/components/auth/auth-shell";
import { forgotPassword } from "@/lib/auth/api";
import { formatError } from "@/lib/errors/format-error";
import { PAGE_PATHS } from "@/lib/navigation-paths";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [devResetPath, setDevResetPath] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (loading) return;

    setLoading(true);
    setError("");
    setMessage("");
    setDevResetPath("");

    try {
      const response = await forgotPassword(email.trim());
      setMessage(response.message);
      if (response.resetPath) {
        setDevResetPath(response.resetPath);
      }
    } catch (err) {
      setError(formatError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      tab="login"
      title="Quên mật khẩu"
      description="Nhập email để nhận hướng dẫn đặt lại mật khẩu"
    >
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

        {error ? (
          <p role="alert" className="rounded-[10px] border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            {error}
          </p>
        ) : null}

        {message ? (
          <div
            role="status"
            className="rounded-[10px] bg-green-100 p-3 text-sm font-semibold text-green-800"
          >
            {message}
            {devResetPath ? (
              <p className="mt-2 text-xs font-normal">
                (Dev) Link reset:{" "}
                <Link href={devResetPath} className="underline">
                  {devResetPath}
                </Link>
              </p>
            ) : null}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-[12px] bg-primary py-3 font-bold text-white shadow-[0_4px_16px_rgba(241,101,34,0.35)] disabled:opacity-70"
        >
          {loading ? "Đang gửi..." : "Gửi hướng dẫn"}
        </button>

        <p className="text-center text-sm text-muted-foreground">
          <Link href={PAGE_PATHS.login} className="font-bold text-primary hover:underline">
            Quay lại đăng nhập
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
