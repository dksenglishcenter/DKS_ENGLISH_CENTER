"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Mail, Phone, User } from "lucide-react";

import { AuthInputField } from "@/components/auth/auth-input-field";
import { registerUser } from "@/lib/auth/api";
import { formatError } from "@/lib/errors/format-error";
import { PAGE_PATHS } from "@/lib/navigation-paths";

export function RegisterForm() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
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
      const response = await registerUser({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        ...(phone.trim() ? { phone: phone.trim() } : {}),
      });

      setSuccess(response.message);
      router.replace(PAGE_PATHS.home);
    } catch (err) {
      setError(formatError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate aria-busy={loading}>
      <AuthInputField
        label="Họ và tên"
        name="fullName"
        placeholder="Nguyễn Văn A"
        icon={User}
        value={fullName}
        onChange={setFullName}
        autoComplete="name"
        required
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <AuthInputField
          label="Số điện thoại"
          name="phone"
          type="tel"
          placeholder="0912 345 678"
          icon={Phone}
          value={phone}
          onChange={setPhone}
          autoComplete="tel"
        />
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
      </div>

      <AuthInputField
        label="Mật khẩu"
        name="password"
        type="password"
        placeholder="Tối thiểu 8 ký tự, có chữ và số"
        icon={Lock}
        value={password}
        onChange={setPassword}
        autoComplete="new-password"
        required
      />

      <div className="rounded-[10px] bg-[#FFF4EC] p-3">
        <p className="text-xs text-[#9B6B50] font-[family-name:var(--font-body)]">
          Bằng cách đăng ký, bạn đồng ý với{" "}
          <span className="cursor-pointer font-semibold text-primary">Điều khoản sử dụng</span> và{" "}
          <span className="cursor-pointer font-semibold text-primary">Chính sách bảo mật</span> của
          DKS.
        </p>
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
        {loading ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
      </button>

      <p className="text-center text-sm text-[#9B6B50] font-[family-name:var(--font-body)]">
        Đã có tài khoản?{" "}
        <Link href={PAGE_PATHS.login} className="font-bold text-primary hover:underline">
          Đăng nhập
        </Link>
      </p>
    </form>
  );
}
