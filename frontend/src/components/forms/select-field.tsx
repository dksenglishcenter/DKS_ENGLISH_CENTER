"use client";

import { ChevronDown } from "lucide-react";

import { FormField } from "@/components/forms/form-field";
import { cn } from "@/components/ui/utils";

type SelectFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  required?: boolean;
  placeholder?: string;
};

export function SelectField({
  label,
  value,
  onChange,
  options,
  required,
  placeholder,
}: SelectFieldProps) {
  return (
    <FormField label={label} required={required}>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          className={cn(
            "h-12 w-full appearance-none cursor-pointer rounded-lg border border-border bg-input-background px-4 py-3 pr-10 font-[family-name:var(--font-body)] transition-all outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary",
            value ? "text-foreground" : "text-muted-foreground/70",
          )}
        >
          <option value="" disabled>
            {placeholder ?? "-- Vui lòng chọn --"}
          </option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
          <ChevronDown className="h-4 w-4 text-primary" />
        </div>
      </div>
    </FormField>
  );
}
