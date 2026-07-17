"use client";

import { useState, type ComponentProps } from "react";
import { Eye, EyeOff } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/components/ui/utils";

type PasswordInputProps = Omit<ComponentProps<"input">, "type"> & {
  toggleLabelShow?: string;
  toggleLabelHide?: string;
};

/** Input mật khẩu dùng chung, tái sử dụng `Input` + nút hiện/ẩn. */
export function PasswordInput({
  className,
  toggleLabelShow = "Hiện mật khẩu",
  toggleLabelHide = "Ẩn mật khẩu",
  ...props
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <Input
        {...props}
        type={visible ? "text" : "password"}
        className={cn("pr-12", className)}
      />
      <button
        type="button"
        aria-label={visible ? toggleLabelHide : toggleLabelShow}
        className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-[#9B6B50] transition-colors hover:text-primary"
        onClick={() => setVisible((current) => !current)}
      >
        {visible ? (
          <EyeOff className="size-5" aria-hidden="true" />
        ) : (
          <Eye className="size-5" aria-hidden="true" />
        )}
      </button>
    </div>
  );
}
