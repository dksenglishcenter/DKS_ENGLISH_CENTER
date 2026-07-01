import * as React from "react";

import { cn } from "./utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-12 w-full rounded-lg border border-border bg-[#FFF9F5] px-4 py-3 text-[#4A2306] placeholder:text-[#C9A090] transition-all outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary font-[family-name:var(--font-body)]",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
