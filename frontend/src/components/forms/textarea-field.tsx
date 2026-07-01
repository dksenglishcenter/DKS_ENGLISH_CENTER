import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/forms/form-field";

type TextareaFieldProps = {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
};

export function TextareaField({
  label,
  placeholder,
  value,
  onChange,
  rows = 4,
}: TextareaFieldProps) {
  return (
    <FormField label={label}>
      <Textarea
        rows={rows}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </FormField>
  );
}
