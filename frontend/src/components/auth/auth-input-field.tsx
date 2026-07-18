"use client";

import { useState } from "react";
import { Eye, EyeOff, type LucideIcon } from "lucide-react";

import { cn } from "@/components/ui/utils";

type AuthInputFieldProps = {
  label: string;
  type?: string;
  placeholder: string;
  icon: LucideIcon;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  autoComplete?: string;
  name?: string;
  required?: boolean;
};

export function AuthInputField({
  label,
  type = "text",
  placeholder,
  icon: Icon,
  value,
  onChange,
  error,
  autoComplete,
  name,
  required,
}: AuthInputFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";

  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-foreground font-[family-name:var(--font-body)]">
        {label}
        {required ? <span className="ml-0.5 text-primary">*</span> : null}
      </label>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          name={name}
          type={isPassword && showPassword ? "text" : type}
          placeholder={placeholder}
          value={value}
          autoComplete={autoComplete}
          required={required}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={Boolean(error)}
          className={cn(
            "w-full rounded-[10px] bg-input-background py-3 pl-10 pr-10 text-sm text-foreground outline-none transition-all font-[family-name:var(--font-body)]",
            "border-[1.5px] focus-visible:border-primary",
            error ? "border-[#d4183d]" : "border-primary/20",
          )}
        />
        {isPassword ? (
          <button
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-primary"
            aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        ) : null}
      </div>
      {error ? (
        <p className="mt-1 text-xs text-[#d4183d] font-[family-name:var(--font-body)]" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
