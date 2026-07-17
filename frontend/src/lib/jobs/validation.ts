import type { JobFormValues, JobPayload } from "./types";

export type JobTextField =
  | "title"
  | "type"
  | "location"
  | "req"
  | "sortOrder";

export type JobFormErrors = Partial<Record<JobTextField, string>> & {
  salaryType?: string;
  salaryMin?: string;
  salaryMax?: string;
  currency?: string;
  duties?: string[];
  benefits?: string[];
  dutiesGeneral?: string;
  benefitsGeneral?: string;
};

const TEXT_RULES: Record<
  Exclude<JobTextField, "sortOrder">,
  { label: string; min: number; max: number }
> = {
  title: { label: "Tên vị trí", min: 2, max: 150 },
  type: { label: "Loại hình làm việc", min: 2, max: 80 },
  location: { label: "Địa điểm", min: 2, max: 120 },
  req: { label: "Yêu cầu ứng viên", min: 2, max: 2000 },
};

function validateText(value: string, label: string, min: number, max: number) {
  const length = value.trim().length;
  if (length < min) return `${label} cần tối thiểu ${min} ký tự.`;
  if (length > max) return `${label} được tối đa ${max} ký tự.`;
  return undefined;
}

function validateItems(
  values: string[],
  singularLabel: string,
): { itemErrors?: string[]; generalError?: string } {
  if (values.length === 0) {
    return { generalError: `Cần ít nhất một ${singularLabel.toLowerCase()}.` };
  }
  if (values.length > 30) {
    return { generalError: `Chỉ được nhập tối đa 30 ${singularLabel.toLowerCase()}.` };
  }

  const normalized = values.map((value) => value.trim());
  const itemErrors = normalized.map((value) => {
    if (value.length < 2) return `${singularLabel} cần tối thiểu 2 ký tự.`;
    if (value.length > 500) return `${singularLabel} được tối đa 500 ký tự.`;
    return "";
  });
  const duplicateIndexes = new Set<number>();
  const firstIndexByValue = new Map<string, number>();
  normalized.forEach((value, index) => {
    if (!value) return;
    const firstIndex = firstIndexByValue.get(value);
    if (firstIndex === undefined) firstIndexByValue.set(value, index);
    else {
      duplicateIndexes.add(firstIndex);
      duplicateIndexes.add(index);
    }
  });
  duplicateIndexes.forEach((index) => {
    itemErrors[index] = `${singularLabel} không được trùng nội dung.`;
  });

  return itemErrors.some(Boolean) ? { itemErrors } : {};
}

export function validateJobForm(values: JobFormValues): JobFormErrors {
  const errors: JobFormErrors = {};

  (Object.keys(TEXT_RULES) as Array<keyof typeof TEXT_RULES>).forEach((field) => {
    const rule = TEXT_RULES[field];
    const error = validateText(values[field], rule.label, rule.min, rule.max);
    if (error) errors[field] = error;
  });

  const sortOrder = Number(values.sortOrder);
  if (
    values.sortOrder.trim() === "" ||
    !Number.isInteger(sortOrder) ||
    sortOrder < 1 ||
    sortOrder > 10000
  ) {
    errors.sortOrder = "Thứ tự hiển thị phải là số nguyên từ 1 đến 10000.";
  }

  const salaryMin = Number(values.salaryMin);
  const salaryMax = Number(values.salaryMax);
  if (!values.salaryType) {
    errors.salaryType = "Vui lòng chọn loại lương.";
  } else if (values.salaryType === "RANGE") {
    if (
      values.salaryMin.trim() === "" ||
      !Number.isInteger(salaryMin) ||
      salaryMin <= 0 ||
      salaryMin > 1000000000
    ) {
      errors.salaryMin = "Lương tối thiểu phải là số nguyên từ 1 đến 1 tỷ.";
    }
    if (
      values.salaryMax.trim() === "" ||
      !Number.isInteger(salaryMax) ||
      salaryMax <= 0 ||
      salaryMax > 1000000000
    ) {
      errors.salaryMax = "Lương tối đa phải là số nguyên từ 1 đến 1 tỷ.";
    } else if (!errors.salaryMin && salaryMax < salaryMin) {
      errors.salaryMax = "Lương tối đa phải lớn hơn hoặc bằng lương tối thiểu.";
    }
  } else if (values.salaryType === "FIXED") {
    if (
      values.salaryMin.trim() === "" ||
      !Number.isInteger(salaryMin) ||
      salaryMin <= 0 ||
      salaryMin > 1000000000
    ) {
      errors.salaryMin = "Mức lương phải là số nguyên từ 1 đến 1 tỷ.";
    }
  }

  if (values.currency !== "VND") {
    errors.currency = "Đơn vị tiền tệ không hợp lệ.";
  }

  const dutiesResult = validateItems(values.duties, "Nhiệm vụ");
  errors.duties = dutiesResult.itemErrors;
  errors.dutiesGeneral = dutiesResult.generalError;

  const benefitsResult = validateItems(values.benefits, "Quyền lợi");
  errors.benefits = benefitsResult.itemErrors;
  errors.benefitsGeneral = benefitsResult.generalError;

  return Object.fromEntries(
    Object.entries(errors).filter(([, value]) => value !== undefined),
  ) as JobFormErrors;
}

export function normalizeJobPayload(values: JobFormValues): JobPayload {
  if (!values.salaryType) {
    throw new Error("Loại lương là bắt buộc trước khi chuẩn hóa dữ liệu.");
  }

  return {
    title: values.title.trim(),
    type: values.type.trim(),
    location: values.location.trim(),
    salaryType: values.salaryType,
    salaryMin:
      values.salaryType === "NEGOTIABLE" ? null : Number(values.salaryMin),
    salaryMax:
      values.salaryType === "RANGE" ? Number(values.salaryMax) : null,
    currency: values.currency,
    duties: values.duties.map((item) => item.trim()),
    benefits: values.benefits.map((item) => item.trim()),
    req: values.req.trim(),
    sortOrder: Number(values.sortOrder),
    isPublished: values.isPublished,
  };
}

export function hasJobFormErrors(errors: JobFormErrors) {
  return Object.values(errors).some((value) =>
    Array.isArray(value) ? value.some(Boolean) : Boolean(value),
  );
}
