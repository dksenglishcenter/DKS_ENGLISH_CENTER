"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { ExamRunner } from "@/components/exam/exam-runner";
import { getExamTest, startAttempt } from "@/lib/mock-test/api";
import type { ExamAttempt, ExamTest } from "@/lib/mock-test/types";

export default function Page() {
  const params = useParams<{ testId: string }>();
  const testId = params.testId;
  const [data, setData] = useState<{ test: ExamTest; attempt: ExamAttempt } | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    (async () => {
      try {
        const [test, attempt] = await Promise.all([
          getExamTest(testId),
          startAttempt(testId),
        ]);
        setData({ test, attempt });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Không mở được đề thi.",
        );
      }
    })();
  }, [testId]);

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 p-6 text-center">
        <p className="text-red-600">{error}</p>
        <p className="text-sm text-muted-foreground">
          Bạn cần{" "}
          <Link href="/login" className="font-semibold text-primary underline">
            đăng nhập
          </Link>{" "}
          để làm bài, rồi thử lại.
        </p>
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

  return <ExamRunner test={data.test} attempt={data.attempt} />;
}
