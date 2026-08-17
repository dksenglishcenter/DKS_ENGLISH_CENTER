"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import type { AttemptResult } from "@/lib/mock-test/types";
import { QuestionField } from "./question-field";
import { QuestionNavigator, type NavState } from "./question-navigator";

export function ExamResult({ result }: { result: AttemptResult }) {
  const router = useRouter();
  const { test, attempt, answers } = result;

  const byQid = useMemo(
    () => new Map(answers.map((a) => [a.questionId, a])),
    [answers],
  );
  const qidByNo = useMemo(() => {
    const map = new Map<number, string>();
    test.sections.forEach((s) =>
      s.groups.forEach((g) => g.questions.forEach((q) => map.set(q.no, q.id))),
    );
    return map;
  }, [test]);

  const stateOf = (no: number): NavState => {
    const id = qidByNo.get(no);
    const a = id ? byQid.get(id) : undefined;
    if (!a || a.isCorrect === null) return "empty";
    return a.isCorrect ? "correct" : "wrong";
  };

  const score = attempt.rawScore ?? 0;

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between border-b border-border bg-card px-4 py-2.5">
        <h1 className="text-sm font-semibold text-foreground sm:text-base">
          Kết quả · {test.title}
        </h1>
        <Button variant="outline" size="sm" onClick={() => router.push("/exam")}>
          Về thư viện
        </Button>
      </header>

      <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6">
        {/* Score summary */}
        <div className="flex flex-wrap items-center gap-6 rounded-2xl border border-border bg-card p-6">
          <div>
            <p className="text-sm text-muted-foreground">Số câu đúng</p>
            <p className="text-4xl font-bold text-foreground">
              {score}
              <span className="text-xl text-muted-foreground">
                /{attempt.total}
              </span>
            </p>
          </div>
          {attempt.band ? (
            <div>
              <p className="text-sm text-muted-foreground">Band</p>
              <p className="text-4xl font-bold text-primary">{attempt.band}</p>
            </div>
          ) : null}
          <div className="ml-auto">
            <Button onClick={() => router.push(`/exam/${test.id}`)}>
              Làm lại
            </Button>
          </div>
        </div>

        {/* Navigator (correct/wrong colours) */}
        <div className="rounded-2xl border border-border bg-card p-4">
          <QuestionNavigator
            sections={test.sections}
            stateOf={stateOf}
            onJump={(no) =>
              document
                .getElementById(`q-${no}`)
                ?.scrollIntoView({ behavior: "smooth", block: "center" })
            }
          />
        </div>

        {/* Review */}
        {test.sections.map((section, i) => (
          <div
            key={section.id}
            className="space-y-4 rounded-2xl border border-border bg-card p-5"
          >
            <h2 className="text-lg font-bold text-foreground">
              {section.heading ?? `Phần ${i + 1}`}
            </h2>

            {section.passageText ? (
              <details className="rounded-lg border border-border p-3">
                <summary className="cursor-pointer text-sm font-semibold text-muted-foreground">
                  Xem lại đoạn văn
                </summary>
                <div className="mt-2 whitespace-pre-line leading-relaxed text-foreground">
                  {section.passageText}
                </div>
              </details>
            ) : null}
            {section.transcript ? (
              <details className="rounded-lg border border-border p-3">
                <summary className="cursor-pointer text-sm font-semibold text-muted-foreground">
                  Xem transcript
                </summary>
                <div className="mt-2 whitespace-pre-line leading-relaxed text-foreground">
                  {section.transcript}
                </div>
              </details>
            ) : null}

            {section.groups.map((group) => (
              <section key={group.id} className="space-y-3">
                <p className="text-sm font-semibold text-muted-foreground">
                  {group.instruction}
                </p>
                {group.questions.map((q) => {
                  const a = byQid.get(q.id);
                  return (
                    <QuestionField
                      key={q.id}
                      question={q}
                      group={group}
                      value={a?.value ?? ""}
                      onChange={() => {}}
                      disabled
                      result={{
                        correctAnswers: q.correctAnswers ?? [],
                        isCorrect: a?.isCorrect ?? null,
                      }}
                    />
                  );
                })}
              </section>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
