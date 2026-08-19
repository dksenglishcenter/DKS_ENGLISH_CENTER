"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { saveAnswers, submitSpeaking, submitWriting } from "@/lib/mock-test/api";
import { attemptStorageKey } from "@/lib/mock-test/storage";
import type { ExamAttempt, ExamQuestion, ExamTest } from "@/lib/mock-test/types";
import { formatError } from "@/lib/errors/format-error";
import { ExamTimer } from "./exam-timer";

function allQuestions(test: ExamTest): ExamQuestion[] {
  return test.sections.flatMap((s) => s.groups.flatMap((g) => g.questions));
}

/** Combine each task's prompt + the student's essay into one document. */
function buildResponseText(
  test: ExamTest,
  answers: Record<string, string>,
): string {
  return allQuestions(test)
    .map((q) => `### ${q.prompt}\n\n${answers[q.id] ?? ""}`)
    .join("\n\n———\n\n");
}

/** Taking screen for Writing (essay) and Speaking (audio upload). */
export function WsRunner({
  test,
  attempt,
  initialAnswers,
}: {
  test: ExamTest;
  attempt: ExamAttempt;
  initialAnswers?: Record<string, string>;
}) {
  const router = useRouter();
  const isWriting = test.skill === "WRITING";
  const [answers, setAnswers] = useState<Record<string, string>>(
    () => initialAnswers ?? {},
  );
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const answersRef = useRef(answers);
  answersRef.current = answers;
  const dirty = useRef<Set<string>>(new Set());
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flush = useCallback(async () => {
    const ids = [...dirty.current];
    dirty.current.clear();
    if (ids.length === 0) return;
    try {
      await saveAnswers(
        attempt.id,
        ids.map((id) => ({ questionId: id, value: answersRef.current[id] ?? "" })),
      );
    } catch {
      ids.forEach((id) => dirty.current.add(id));
    }
  }, [attempt.id]);

  const onEssayChange = useCallback(
    (questionId: string, value: string) => {
      setAnswers((prev) => ({ ...prev, [questionId]: value }));
      dirty.current.add(questionId);
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => void flush(), 1200);
    },
    [flush],
  );

  const handleSubmit = useCallback(async () => {
    if (submitting) return;
    setError(null);
    if (!isWriting && !file) {
      setError("Vui lòng chọn file ghi âm câu trả lời.");
      return;
    }
    setSubmitting(true);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    await flush();
    try {
      const result = isWriting
        ? await submitWriting(attempt.id, buildResponseText(test, answersRef.current))
        : await submitSpeaking(attempt.id, file as File);
      localStorage.removeItem(attemptStorageKey(test.id));
      router.replace(`/exam/result/${result.attempt.id}`);
    } catch (err) {
      setError(formatError(err));
      setSubmitting(false);
    }
  }, [attempt.id, file, flush, isWriting, router, submitting, test]);

  const questions = allQuestions(test);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex items-center justify-between gap-4 border-b border-border bg-card px-4 py-2.5">
        <Button variant="outline" size="sm" onClick={() => router.push("/exam")}>
          Thoát
        </Button>
        <h1 className="text-center text-sm font-semibold text-foreground sm:text-base">
          {test.title}
        </h1>
        <div className="w-16" />
      </header>

      <div className="mx-auto w-full max-w-3xl flex-1 space-y-6 p-4 sm:p-6">
        <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-4">
          <ExamTimer endsAt={attempt.endsAt} onExpire={() => void handleSubmit()} />
          <Button onClick={() => void handleSubmit()} disabled={submitting}>
            {submitting ? "Đang nộp…" : "NỘP BÀI"}
          </Button>
        </div>

        {questions.map((q, i) => (
          <div
            key={q.id}
            className="space-y-3 rounded-2xl border border-border bg-card p-5"
          >
            <p className="font-semibold text-foreground">
              {questions.length > 1 ? `Phần ${i + 1}. ` : ""}
              {q.prompt}
            </p>
            {isWriting ? (
              <Textarea
                className="min-h-64"
                placeholder="Viết bài của bạn ở đây…"
                value={answers[q.id] ?? ""}
                disabled={submitting}
                onChange={(e) => onEssayChange(q.id, e.target.value)}
              />
            ) : null}
          </div>
        ))}

        {!isWriting ? (
          <div className="space-y-3 rounded-2xl border border-border bg-card p-5">
            <p className="font-semibold text-foreground">Bài ghi âm</p>
            <p className="text-sm text-muted-foreground">
              Ghi âm câu trả lời (dùng điện thoại/máy tính) rồi tải lên đây.
            </p>
            <input
              type="file"
              accept="audio/*"
              disabled={submitting}
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            {file ? (
              <p className="text-sm text-green-700">Đã chọn: {file.name}</p>
            ) : null}
          </div>
        ) : null}

        {error ? <p className="text-red-600">{error}</p> : null}
      </div>
    </div>
  );
}
