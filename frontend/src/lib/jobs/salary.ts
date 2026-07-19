import type { SalaryCurrency, SalaryType } from "./types";

/** Keep in sync with backend jobs/job-salary.ts */
export const SALARY_AMOUNT = {
  min: 1,
  max: 1_000_000_000,
} as const;

type SalaryData = {
  salaryType: SalaryType;
  salaryMin: number | null;
  salaryMax: number | null;
  currency: SalaryCurrency;
};

const SALARY_FORMATTER = new Intl.NumberFormat("vi-VN");

export function formatJobSalary({
  salaryType,
  salaryMin,
  salaryMax,
  currency,
}: SalaryData) {
  if (salaryType === "NEGOTIABLE") return "Thỏa thuận";
  if (salaryType === "FIXED" && salaryMin !== null) {
    return `${SALARY_FORMATTER.format(salaryMin)} ${currency}`;
  }
  if (salaryType === "RANGE" && salaryMin !== null && salaryMax !== null) {
    return `${SALARY_FORMATTER.format(salaryMin)} – ${SALARY_FORMATTER.format(salaryMax)} ${currency}`;
  }
  return "Chưa cập nhật";
}

export function isValidSalaryAmount(value: number) {
  return (
    Number.isInteger(value) &&
    value >= SALARY_AMOUNT.min &&
    value <= SALARY_AMOUNT.max
  );
}
