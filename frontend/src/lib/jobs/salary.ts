import type { SalaryCurrency, SalaryType } from "./types";

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
