"use client";

import { useEffect, useState } from "react";
import { Check, Clock, Mail, MapPin, Phone, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getContactInformation,
  replaceContactInformation,
} from "@/lib/contact/api";
import { invalidateContactInformationCache } from "@/lib/contact/actions";
import type { ContactInformationPayload } from "@/lib/contact/types";
import {
  type ContactInformationErrors,
  type ContactInformationField,
  validateContactInformation,
} from "@/lib/contact/validation";
import { ApiError, formatError } from "@/lib/errors/format-error";

const EMPTY_FORM: ContactInformationPayload = {
  phone: "",
  email: "",
  address: "",
  hours: "",
  mapEmbed: "",
};

type FieldConfig = {
  name: ContactInformationField;
  label: string;
  type?: "text" | "email" | "tel" | "url";
  autoComplete?: string;
  icon: typeof Phone;
};

const FIELDS: FieldConfig[] = [
  {
    name: "phone",
    label: "Số điện thoại",
    type: "tel",
    autoComplete: "tel",
    icon: Phone,
  },
  {
    name: "email",
    label: "Email",
    type: "email",
    autoComplete: "email",
    icon: Mail,
  },
  {
    name: "address",
    label: "Địa chỉ",
    autoComplete: "street-address",
    icon: MapPin,
  },
  {
    name: "hours",
    label: "Giờ làm việc",
    icon: Clock,
  },
  {
    name: "mapEmbed",
    label: "Google Maps URL / Embed",
    type: "url",
    icon: MapPin,
  },
];

function ContactField({
  field,
  value,
  error,
  disabled,
  onChange,
}: {
  field: FieldConfig;
  value: string;
  error?: string;
  disabled: boolean;
  onChange: (name: ContactInformationField, value: string) => void;
}) {
  const Icon = field.icon;
  const errorId = `${field.name}-error`;

  return (
    <div className="space-y-2">
      <Label
        htmlFor={field.name}
        className="flex items-center gap-2 text-sm font-bold text-[#4A2306]"
      >
        <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
        {field.label}
      </Label>
      <Input
        id={field.name}
        name={field.name}
        type={field.type ?? "text"}
        autoComplete={field.autoComplete}
        value={value}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={error ? "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-200" : undefined}
        onChange={(event) => onChange(field.name, event.target.value)}
      />
      {error ? (
        <p id={errorId} className="text-xs font-medium text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function ContactInformationAdmin() {
  const [form, setForm] = useState<ContactInformationPayload>(EMPTY_FORM);
  const [errors, setErrors] = useState<ContactInformationErrors>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasExistingData, setHasExistingData] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const loadContactInformation = async () => {
    setLoading(true);
    setLoadError(null);
    setMessage(null);

    try {
      const response = await getContactInformation();
      const { phone, email, address, hours, mapEmbed } = response.contactInfo;
      setForm({ phone, email, address, hours, mapEmbed });
      setHasExistingData(true);
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        setForm(EMPTY_FORM);
        setHasExistingData(false);
      } else {
        setLoadError(formatError(error));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    getContactInformation()
      .then((response) => {
        if (cancelled) return;
        const { phone, email, address, hours, mapEmbed } = response.contactInfo;
        setForm({ phone, email, address, hours, mapEmbed });
        setHasExistingData(true);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        if (error instanceof ApiError && error.status === 404) {
          setForm(EMPTY_FORM);
          setHasExistingData(false);
        } else {
          setLoadError(formatError(error));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleChange = (name: ContactInformationField, value: string) => {
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
    setFormError(null);
    setMessage(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    setMessage(null);

    const validationErrors = validateContactInformation(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      setFormError("Vui lòng sửa các trường chưa hợp lệ trước khi lưu.");
      const firstInvalid = Object.keys(validationErrors)[0];
      document.getElementById(firstInvalid)?.focus();
      return;
    }

    const payload: ContactInformationPayload = {
      phone: form.phone.trim(),
      email: form.email.trim(),
      address: form.address.trim(),
      hours: form.hours.trim(),
      mapEmbed: form.mapEmbed.trim(),
    };

    setSaving(true);
    try {
      const response = await replaceContactInformation(payload);
      await invalidateContactInformationCache();
      const { phone, email, address, hours, mapEmbed } = response.contactInfo;
      setForm({ phone, email, address, hours, mapEmbed });
      setHasExistingData(true);
      setMessage(response.message);
    } catch (error) {
      setFormError(formatError(error));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl rounded-2xl border border-border bg-white p-6 text-sm text-[#9B6B50]">
        Đang tải thông tin liên hệ...
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="max-w-2xl rounded-2xl border border-red-200 bg-white p-6">
        <p role="alert" className="text-sm text-red-700">
          {loadError}
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={() => void loadContactInformation()}
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Thử tải lại
        </Button>
      </div>
    );
  }

  return (
    <section aria-labelledby="contact-admin-title" className="max-w-2xl">
      <div className="mb-6">
        <h2
          id="contact-admin-title"
          className="text-xl font-black text-[#4A2306] font-[family-name:var(--font-nunito)]"
        >
          Thông tin liên hệ
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-[#9B6B50]">
          Thông tin liên hệ được sử dụng đồng bộ tại Footer và trang Liên hệ.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="space-y-5 rounded-2xl border border-border bg-white p-5 shadow-[0_4px_24px_rgba(74,35,6,0.04)] sm:p-6"
      >
        {!hasExistingData ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            Chưa có dữ liệu. Lần lưu đầu tiên sẽ tạo thông tin liên hệ.
          </div>
        ) : null}

        {FIELDS.map((field) => (
          <ContactField
            key={field.name}
            field={field}
            value={form[field.name]}
            error={errors[field.name]}
            disabled={saving}
            onChange={handleChange}
          />
        ))}

        {formError ? (
          <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700">
            {formError}
          </p>
        ) : null}
        {message ? (
          <p
            role="status"
            className="rounded-xl bg-green-50 p-3 text-center text-sm font-semibold text-green-700"
          >
            {message}
          </p>
        ) : null}

        <Button type="submit" className="w-full" disabled={saving}>
          <Check className="h-4 w-4" aria-hidden="true" />
          {saving
            ? "Đang lưu..."
            : hasExistingData
              ? "Lưu thay đổi"
              : "Tạo thông tin liên hệ"}
        </Button>
      </form>
    </section>
  );
}
