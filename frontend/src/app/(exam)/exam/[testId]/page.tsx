"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import { ExamRunner } from "@/components/exam/exam-runner";
import { WsRunner } from "@/components/exam/ws-runner";
import {
  getAttemptState,
  getExamTest,
  startAttempt,
} from "@/lib/mock-test/api";
import { attemptStorageKey } from "@/lib/mock-test/storage";
import type { ExamAttempt, ExamTest } from "@/lib/mock-test/types";

type Loaded = {
  test: ExamTest;
  attempt: ExamAttempt;
  initialAnswers: Record<string, string>;
};

export default function Page() {
  const params = useParams<{ testId: string }>();
  const router = useRouter();
  const testId = params.testId;
  const [data, setData] = useState<Loaded | null>(null);
  const [error, setError] = useState<string | null>(null);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    (async () => {
      try {
        const test = await getExamTest(testId);
        const key = attemptStorageKey(testId);
        const storedId =
          typeof window !== "undefined" ? localStorage.getItem(key) : null;

        // Resume an in-progress attempt if we have one saved locally.
        if (storedId) {
          try {
            const state = await getAttemptState(storedId);
            if (state.attempt.status === "IN_PROGRESS") {
              setData({
                test,
                attempt: state.attempt,
                initialAnswers: Object.fromEntries(
                  state.answers.map((a) => [a.questionId, a.value ?? ""]),
                ),
              });
              return;
            }
            // Already submitted → go straight to the result.
            localStorage.removeItem(key);
            router.replace(`/exam/result/${storedId}`);
            return;
          } catch {
            localStorage.removeItem(key); // stale id → start fresh
          }
        }

        const attempt = await startAttempt(testId);
        localStorage.setItem(key, attempt.id);
        setData({ test, attempt, initialAnswers: {} });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Không mở được đề thi.");
      }
    })();
  }, [router, testId]);

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 p-6 text-center">
        <p className="text-red-600">{error}</p>
        <Link href="/exam" className="text-sm text-primary underline">
          ← Về thư viện đề
        </Link>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        Đang chuẩn bị đề thi…
      </div>
    );
  }

  const isWs =
    data.test.skill === "WRITING" || data.test.skill === "SPEAKING";
  const Runner = isWs ? WsRunner : ExamRunner;

  return (
    <Runner
      test={data.test}
      attempt={data.attempt}
      initialAnswers={data.initialAnswers}
    />
  );
}
