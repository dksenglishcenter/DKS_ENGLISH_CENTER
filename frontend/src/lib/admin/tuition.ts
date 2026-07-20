/** Tuition string <-> editor state. Kept pure so it can be tested without the UI. */

export const TUITION_UNITS = ["buổi", "tháng", "khóa", "giờ"] as const;
export const TUITION_NEGOTIABLE_TEXT = "Liên hệ tư vấn";

export type TuitionMode = "fixed" | "range" | "negotiable";

export type TuitionState = {
  mode: TuitionMode;
  min: string;
  max: string;
  unit: string;
};

/** 1234567 -> "1.234.567" */
export function groupDigits(digits: string): string {
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/** Keep digits only, then group. Empty stays empty. */
export function formatAmount(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  return digits ? groupDigits(digits) : "";
}

/** Rebuild the editor state from a stored tuition string. */
export function parseTuition(value: string): TuitionState {
  const fallback: TuitionState = {
    mode: "fixed",
    min: "",
    max: "",
    unit: TUITION_UNITS[0],
  };
  const text = value.trim();
  if (!text) return fallback;

  // No digits at all -> treat as "contact us" style text.
  if (!/\d/.test(text)) return { ...fallback, mode: "negotiable" };

  const unit = TUITION_UNITS.find((u) => text.includes(`/${u}`)) ?? TUITION_UNITS[0];
  const amounts = text.match(/[\d.]+/g)?.map((a) => a.replace(/\./g, "")) ?? [];

  if (amounts.length >= 2) {
    return {
      mode: "range",
      min: groupDigits(amounts[0]),
      max: groupDigits(amounts[1]),
      unit,
    };
  }
  if (amounts.length === 1) {
    return { mode: "fixed", min: groupDigits(amounts[0]), max: "", unit };
  }
  return fallback;
}

/** Build the string stored in the database and shown on the website. */
export function buildTuition(state: TuitionState): string {
  if (state.mode === "negotiable") return TUITION_NEGOTIABLE_TEXT;
  if (state.mode === "range") {
    if (!state.min || !state.max) return "";
    return `${state.min} – ${state.max} ₫/${state.unit}`;
  }
  if (!state.min) return "";
  return `${state.min} ₫/${state.unit}`;
}
