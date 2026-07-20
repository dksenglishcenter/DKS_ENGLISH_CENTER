"use client";

import { useState } from "react";

import {
  buildTuition,
  formatAmount,
  parseTuition,
  TUITION_UNITS,
  type TuitionMode,
  type TuitionState,
} from "@/lib/admin/tuition";

const MODE_LABELS: { value: TuitionMode; label: string }[] = [
  { value: "fixed", label: "Một mức giá" },
  { value: "range", label: "Khoảng giá" },
  { value: "negotiable", label: "Liên hệ tư vấn" },
];

export function TuitionField({
  value,
  onChange,
  error,
}: {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  const [state, setState] = useState<TuitionState>(() => parseTuition(value));
  const [lastValue, setLastValue] = useState(value);

  // Re-parse when the form switches to another course (value changed from outside).
  if (value !== lastValue) {
    setLastValue(value);
    if (buildTuition(state) !== value) setState(parseTuition(value));
  }

  function update(patch: Partial<TuitionState>) {
    const next = { ...state, ...patch };
    setState(next);
    onChange(buildTuition(next));
  }

  const preview = buildTuition(state);
  const amountClass = `w-36 rounded-lg border px-3 py-2 text-right tabular-nums ${
    error ? "border-red-500" : "border-border"
  }`;

  return (
    <div className="block text-sm" data-invalid={error ? "true" : undefined}>
      <span className="mb-1 block font-semibold text-foreground">Học phí</span>

      <div className="mb-3 flex flex-wrap gap-4">
        {MODE_LABELS.map((option) => (
          <label
            key={option.value}
            className="flex cursor-pointer items-center gap-1.5"
          >
            <input
              type="radio"
              name="tuition-mode"
              className="accent-primary"
              checked={state.mode === option.value}
              onChange={() => update({ mode: option.value })}
            />
            <span className="text-foreground">{option.label}</span>
          </label>
        ))}
      </div>

      {state.mode !== "negotiable" ? (
        <div className="flex flex-wrap items-center gap-2">
          {state.mode === "range" ? (
            <span className="text-muted-foreground">Từ</span>
          ) : null}
          <input
            inputMode="numeric"
            className={amountClass}
            placeholder="350.000"
            value={state.min}
            onChange={(event) =>
              update({ min: formatAmount(event.target.value) })
            }
          />
          {state.mode === "range" ? (
            <>
              <span className="text-muted-foreground">đến</span>
              <input
                inputMode="numeric"
                className={amountClass}
                placeholder="500.000"
                value={state.max}
                onChange={(event) =>
                  update({ max: formatAmount(event.target.value) })
                }
              />
            </>
          ) : null}
          <span className="text-muted-foreground">₫ /</span>
          <select
            className="rounded-lg border border-border bg-card px-3 py-2"
            value={state.unit}
            onChange={(event) => update({ unit: event.target.value })}
          >
            {TUITION_UNITS.map((unit) => (
              <option key={unit} value={unit}>
                {unit}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      <p className="mt-2 text-xs text-muted-foreground">
        Xem trước:{" "}
        <span className="font-semibold text-foreground">
          {preview || "— chưa nhập —"}
        </span>
      </p>

      {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
