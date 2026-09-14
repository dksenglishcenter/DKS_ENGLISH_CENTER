"use client";

import type { ExamSection } from "@/lib/mock-test/types";

export type NavState = "answered" | "empty" | "correct" | "wrong";

/** Grid of question numbers, grouped by section (Passage 1, Recording 1…). */
export function QuestionNavigator({
  sections,
  stateOf,
  onJump,
}: {
  sections: ExamSection[];
  stateOf: (questionNo: number) => NavState;
  onJump: (questionNo: number) => void;
}) {
  return (
    <div className="space-y-3">
      {sections.map((section, i) => {
        const numbers = section.groups
          .flatMap((g) => g.questions.map((q) => q.no))
          .sort((a, b) => a - b);
        return (
          <div key={section.id}>
            <p className="mb-1.5 text-sm font-semibold text-foreground">
              {section.heading ?? `Phần ${i + 1}`}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {numbers.map((no) => (
                <button
                  key={no}
                  type="button"
                  onClick={() => onJump(no)}
                  className={cellClass(stateOf(no))}
                  aria-label={`Câu ${no}`}
                >
                  {no}
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function cellClass(state: NavState): string {
  const base =
    "flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border text-sm font-semibold transition-colors";
  switch (state) {
    case "answered":
      return `${base} border-primary bg-primary text-primary-foreground`;
    case "correct":
      return `${base} border-green-600 bg-green-600 text-white`;
    case "wrong":
      return `${base} border-red-500 bg-red-500 text-white`;
    default:
      return `${base} border-border bg-card text-foreground hover:border-primary`;
  }
}
