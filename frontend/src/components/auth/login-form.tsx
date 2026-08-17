"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Mail } from "lucide-react";

import { AuthInputField } from "@/components/auth/auth-input-field";
import { loginUser } from "@/lib/auth/api";
import { homePathForRole } from "@/lib/auth/home-path";
import { formatError } from "@/lib/errors/format-error";
import { PAGE_PATHS } from "@/lib/navigation-paths";
import { SOCIAL_LINKS } from "@/lib/social-links";

const REMEMBER_EMAIL_KEY = "dks_remember_email";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(REMEMBER_EMAIL_KEY);
      if (saved) {
        setEmail(saved);
        setRememberMe(true);
      }
    } catch {
      // ignore
    }
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (loading) return;

    setLoading(true);
    setError("");
    setSuccess("");

    if (password.length < 8) {
      setError("Mật khẩu phải có ít nhất 8 ký tự.");
      setLoading(false);
      return;
    }

    try {
      const trimmedEmail = email.trim();
      const response = await loginUser({
        email: trimmedEmail,
        password,
        rememberMe,
      });

      try {
        if (rememberMe) {
          localStorage.setItem(REMEMBER_EMAIL_KEY, trimmedEmail);
        } else {
          localStorage.removeItem(REMEMBER_EMAIL_KEY);
        }
      } catch {
        // ignore
      }

      setSuccess(response.message);
      router.replace(homePathForRole(response.user.role));
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
        maxLength={255}
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
        minLength={8}
        maxLength={72}
        required
      />

      <div className="flex items-center justify-between">
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(event) => setRememberMe(event.target.checked)}
            className="h-3.5 w-3.5 rounded accent-primary"
          />
          <span className="text-sm text-muted-foreground font-[family-name:var(--font-body)]">
            Ghi nhớ đăng nhập
          </span>
        </label>
        <a
          href={SOCIAL_LINKS.zalo}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-semibold text-primary hover:underline font-[family-name:var(--font-body)]"
        >
          Quên mật khẩu? Liên hệ Zalo
        </a>
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

      <p className="text-center text-sm text-muted-foreground font-[family-name:var(--font-body)]">
        Chưa có tài khoản?{" "}
        <Link href={PAGE_PATHS.register} className="font-bold text-primary hover:underline">
          Đăng ký ngay
        </Link>
      </p>
    </form>
  );
}
