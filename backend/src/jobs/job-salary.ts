export const SALARY_TYPES = ['RANGE', 'FIXED', 'NEGOTIABLE'] as const;
export type SalaryType = (typeof SALARY_TYPES)[number];

export const SALARY_CURRENCIES = ['VND'] as const;
export type SalaryCurrency = (typeof SALARY_CURRENCIES)[number];
