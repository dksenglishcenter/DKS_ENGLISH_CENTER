export const SALARY_TYPES = ['RANGE', 'FIXED', 'NEGOTIABLE'] as const;
export type SalaryType = (typeof SALARY_TYPES)[number];

export const SALARY_CURRENCIES = ['VND'] as const;
export type SalaryCurrency = (typeof SALARY_CURRENCIES)[number];

/** Keep in sync with frontend lib/jobs/salary.ts */
export const SALARY_AMOUNT = {
  min: 1,
  max: 1_000_000_000,
} as const;
