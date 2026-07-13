import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./utils";

const buttonVariants = cva(
  "inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 font-[family-name:var(--font-heading)] motion-reduce:transform-none",
  {
    variants: {
      variant: {
        primary:
          "bg-gradient-to-br from-primary to-primary-hover text-white shadow-md shadow-primary/20 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/25",
        secondary:
          "bg-gradient-to-br from-accent to-primary text-white shadow-md shadow-primary/15 hover:-translate-y-0.5 hover:shadow-lg",
        outline:
          "border-2 border-primary text-primary hover:-translate-y-0.5 hover:bg-primary hover:text-white",
        ghost: "text-primary hover:bg-secondary",
      },
      size: {
        sm: "min-h-10 px-4 py-2 text-sm",
        md: "min-h-11 px-6 py-3 text-[15px]",
        lg: "min-h-12 px-8 py-4 text-base",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
