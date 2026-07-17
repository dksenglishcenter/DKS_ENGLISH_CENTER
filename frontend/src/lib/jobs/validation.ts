import type { JobFormValues, JobPayload } from "./types";

export type JobTextField =
  | "title"
  | "type"
  | "location"
  | "salary"
  | "req"
  | "sortOrder";

export type JobFormErrors = Partial<Record<JobTextField, string>> & {
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
  salary: { label: "Mức lương", min: 2, max: 120 },
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
    sortOrder < 0 ||
    sortOrder > 10000
  ) {
    errors.sortOrder = "Thứ tự hiển thị phải là số nguyên từ 0 đến 10000.";
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
  return {
    title: values.title.trim(),
    type: values.type.trim(),
    location: values.location.trim(),
    salary: values.salary.trim(),
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
