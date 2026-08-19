"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { listExamTests } from "@/lib/mock-test/api";
import type { ExamSkill, ExamTestSummary } from "@/lib/mock-test/types";

const SKILL_LABEL: Record<ExamSkill, string> = {
  LISTENING: "Nghe",
  READING: "Đọc",
  WRITING: "Viết",
  SPEAKING: "Nói",
};

export function ExamLibrary() {
  const [tests, setTests] = useState<ExamTestSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await listExamTests();
        if (!cancelled) setTests(data);
      } catch (err) {
        if (!cancelled)
          setError(
            err instanceof Error ? err.message : "Không tải được danh sách đề",
          );
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-bold text-foreground">Thi thử IELTS</h1>
      <p className="mt-1 text-muted-foreground">
        Chọn một đề để bắt đầu làm bài.
      </p>

      {loading ? (
        <p className="mt-8 text-muted-foreground">Đang tải…</p>
      ) : error ? (
        <p className="mt-8 text-red-600">{error}</p>
      ) : tests.length === 0 ? (
        <p className="mt-8 text-muted-foreground">Chưa có đề nào được mở.</p>
      ) : (
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {tests.map((t) => (
            <li key={t.id}>
              <Link
                href={`/exam/${t.id}`}
                className="block rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary"
              >
                <span className="inline-block rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-primary">
                  {SKILL_LABEL[t.skill]}
                </span>
                <h2 className="mt-2 font-bold text-foreground">{t.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t.durationMinutes} phút · {t.code}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
