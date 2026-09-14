"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { ExamResult } from "@/components/exam/exam-result";
import { getAttemptResult } from "@/lib/mock-test/api";
import type { AttemptResult } from "@/lib/mock-test/types";

export default function Page() {
  const params = useParams<{ attemptId: string }>();
  const [result, setResult] = useState<AttemptResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getAttemptResult(params.attemptId);
        if (!cancelled) setResult(data);
      } catch (err) {
        if (!cancelled)
          setError(
            err instanceof Error ? err.message : "Không tải được kết quả.",
          );
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [params.attemptId]);

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

  if (!result) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        Đang tải kết quả…
      </div>
    );
  }

  return <ExamResult result={result} />;
}
