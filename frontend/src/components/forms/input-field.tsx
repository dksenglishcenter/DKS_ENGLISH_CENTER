import { Input } from "@/components/ui/input";
import { FormField } from "@/components/forms/form-field";

type InputFieldProps = {
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
};

export function InputField({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  required,
}: InputFieldProps) {
  return (
    <FormField label={label} required={required}>
      <Input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
      />
    </FormField>
  );
}
