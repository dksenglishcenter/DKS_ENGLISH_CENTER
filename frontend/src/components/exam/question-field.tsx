"use client";

import { Input } from "@/components/ui/input";
import type {
  ExamQuestion,
  ExamQuestionGroup,
  ExamQuestionType,
  QuestionOptions,
} from "@/lib/mock-test/types";

const COMPLETION: ReadonlySet<ExamQuestionType> = new Set([
  "NOTE_COMPLETION",
  "TABLE_COMPLETION",
  "SUMMARY_COMPLETION",
  "SENTENCE_COMPLETION",
]);
const LETTER_CHOICE: ReadonlySet<ExamQuestionType> = new Set([
  "MATCHING",
  "CLASSIFICATION",
  "MATCHING_PARAGRAPH",
]);

/** Full labels for radios (MCQ: "A. text"; T/F/NG: the label itself). */
function fullOptions(options: QuestionOptions): { value: string; label: string }[] {
  if (!options) return [];
  if (Array.isArray(options)) return options.map((o) => ({ value: o, label: o }));
  return Object.entries(options).map(([k, v]) => ({ value: k, label: `${k}. ${v}` }));
}

/** Just the letters/labels, for a compact dropdown. */
function letterOptions(options: QuestionOptions): string[] {
  if (!options) return [];
  if (Array.isArray(options)) return options;
  return Object.keys(options);
}

export type ResultInfo = { correctAnswers: string[]; isCorrect: boolean | null };

export function QuestionField({
  question,
  group,
  value,
  onChange,
  disabled,
  result,
}: {
  question: ExamQuestion;
  group: ExamQuestionGroup;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  result?: ResultInfo;
}) {
  const no = question.no;
  const name = `q-${no}`;

  return (
    <div id={`q-${no}`} className="scroll-mt-24">
      <div className="flex gap-3">
        <span
          className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold ${badge(
            result,
          )}`}
        >
          {no}
        </span>
        <div className="min-w-0 flex-1 space-y-2">
          {question.prompt ? (
            <p className="leading-relaxed text-foreground">{question.prompt}</p>
          ) : null}

          {COMPLETION.has(group.type) ? (
            <Input
              className="h-11 max-w-sm"
              value={value}
              disabled={disabled}
              placeholder="Nhập đáp án…"
              onChange={(e) => onChange(e.target.value)}
            />
          ) : LETTER_CHOICE.has(group.type) ? (
            <select
              className="h-11 w-40 rounded-lg border border-border bg-card px-3 text-foreground disabled:opacity-70"
              value={value}
              disabled={disabled}
              onChange={(e) => onChange(e.target.value)}
            >
              <option value="">— chọn —</option>
              {letterOptions(group.options).map((letter) => (
                <option key={letter} value={letter}>
                  {letter}
                </option>
              ))}
            </select>
          ) : (
            <div className="space-y-1.5">
              {fullOptions(
                group.type === "MULTIPLE_CHOICE" ? question.options : group.options,
              ).map((opt) => (
                <label
                  key={opt.value}
                  className={`flex cursor-pointer items-start gap-2 rounded-lg px-2 py-1.5 ${
                    value === opt.value ? "bg-secondary" : "hover:bg-secondary/60"
                  }`}
                >
                  <input
                    type="radio"
                    name={name}
                    className="mt-1 accent-primary"
                    checked={value === opt.value}
                    disabled={disabled}
                    onChange={() => onChange(opt.value)}
                  />
                  <span className="text-foreground">{opt.label}</span>
                </label>
              ))}
            </div>
          )}

          {result ? (
            <p className="text-sm">
              <span
                className={
                  result.isCorrect ? "text-green-700" : "text-red-600"
                }
              >
                {result.isCorrect ? "✓ Đúng" : "✗ Sai"}
              </span>
              <span className="text-muted-foreground">
                {" "}
                · Đáp án: {result.correctAnswers.join(" / ")}
              </span>
              {question.explanation ? (
                <span className="mt-1 block text-muted-foreground">
                  {question.explanation}
                </span>
              ) : null}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function badge(result?: ResultInfo): string {
  if (!result) return "bg-secondary text-primary";
  return result.isCorrect
    ? "bg-green-600 text-white"
    : "bg-red-500 text-white";
}
