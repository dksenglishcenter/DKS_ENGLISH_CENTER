"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { saveAnswers, submitAttempt } from "@/lib/mock-test/api";
import type {
  ExamAttempt,
  ExamQuestionGroup,
  ExamTest,
} from "@/lib/mock-test/types";
import { ExamTimer } from "./exam-timer";
import { QuestionField } from "./question-field";
import { QuestionNavigator, type NavState } from "./question-navigator";

export function ExamRunner({
  test,
  attempt,
}: {
  test: ExamTest;
  attempt: ExamAttempt;
}) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [active, setActive] = useState(0);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const answersRef = useRef(answers);
  answersRef.current = answers;
  const dirty = useRef<Set<string>>(new Set());
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // question id ↔ number, for the navigator and jumping.
  const { qidByNo, sectionOfNo } = useMemo(() => {
    const qidByNo = new Map<number, string>();
    const sectionOfNo = new Map<number, number>();
    test.sections.forEach((s, si) =>
      s.groups.forEach((g) =>
        g.questions.forEach((q) => {
          qidByNo.set(q.no, q.id);
          sectionOfNo.set(q.no, si);
        }),
      ),
    );
    return { qidByNo, sectionOfNo };
  }, [test]);

  const flush = useCallback(async () => {
    const ids = [...dirty.current];
    dirty.current.clear();
    if (ids.length === 0) return;
    const payload = ids.map((questionId) => ({
      questionId,
      value: answersRef.current[questionId] ?? "",
    }));
    try {
      await saveAnswers(attempt.id, payload);
      setSavedAt(Date.now());
    } catch {
      // Keep the ids so the next flush retries.
      ids.forEach((id) => dirty.current.add(id));
    }
  }, [attempt.id]);

  const handleChange = useCallback(
    (questionId: string, value: string) => {
      setAnswers((prev) => ({ ...prev, [questionId]: value }));
      dirty.current.add(questionId);
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => void flush(), 1200);
    },
    [flush],
  );

  const doSubmit = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    await flush();
    try {
      const result = await submitAttempt(attempt.id);
      router.replace(`/exam/result/${result.attempt.id}`);
    } catch {
      setSubmitting(false);
      setConfirmOpen(false);
    }
  }, [attempt.id, flush, router, submitting]);

  const jumpTo = useCallback(
    (no: number) => {
      const si = sectionOfNo.get(no);
      if (si !== undefined && si !== active) setActive(si);
      requestAnimationFrame(() => {
        document
          .getElementById(`q-${no}`)
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    },
    [active, sectionOfNo],
  );

  const stateOf = useCallback(
    (no: number): NavState => {
      const id = qidByNo.get(no);
      return id && (answers[id] ?? "").trim() !== "" ? "answered" : "empty";
    },
    [answers, qidByNo],
  );

  const section = test.sections[active];

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Top bar */}
      <header className="flex items-center justify-between border-b border-border bg-card px-4 py-2.5">
        <span className="w-24" />
        <h1 className="text-center text-sm font-semibold text-foreground sm:text-base">
          {test.title}
        </h1>
        <div className="flex w-24 justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/exam")}
          >
            Thoát
          </Button>
        </div>
      </header>

      {/* Audio bar (Listening) */}
      {test.audioUrl ? (
        <div className="border-b border-border bg-card px-4 py-2">
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <audio src={test.audioUrl} controls className="w-full" />
        </div>
      ) : null}

      <div className="flex min-h-0 flex-1">
        {/* Content: passage + questions */}
        <div className="flex min-h-0 flex-1 flex-col">
          {/* Section tabs */}
          <div className="flex gap-2 border-b border-border bg-card px-4 py-2">
            {test.sections.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setActive(i)}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                  i === active
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-foreground hover:bg-secondary/70"
                }`}
              >
                {s.heading ?? `Phần ${i + 1}`}
              </button>
            ))}
          </div>

          <div className="flex min-h-0 flex-1">
            {section.passageText ? (
              <article className="min-h-0 flex-1 overflow-y-auto border-r border-border p-5">
                {section.heading ? (
                  <h2 className="mb-3 text-lg font-bold text-foreground">
                    {section.heading}
                  </h2>
                ) : null}
                <div className="whitespace-pre-line leading-relaxed text-foreground">
                  {section.passageText}
                </div>
              </article>
            ) : null}

            <div className="min-h-0 flex-1 overflow-y-auto p-5">
              {section.context ? (
                <p className="mb-4 text-sm text-muted-foreground">
                  {section.context}
                </p>
              ) : null}
              <div className="space-y-6">
                {section.groups.map((group) => (
                  <GroupBlock
                    key={group.id}
                    group={group}
                    answers={answers}
                    onChange={handleChange}
                    disabled={submitting}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="flex w-64 shrink-0 flex-col gap-4 border-l border-border bg-card p-4">
          <ExamTimer endsAt={attempt.endsAt} onExpire={() => void doSubmit()} />
          <Button
            className="w-full"
            onClick={() => setConfirmOpen(true)}
            disabled={submitting}
          >
            {submitting ? "Đang nộp…" : "NỘP BÀI"}
          </Button>
          <p className="text-xs text-muted-foreground">
            {savedAt ? "Đã tự lưu bài làm" : "Bài làm được tự lưu liên tục"}
          </p>
          <div className="min-h-0 flex-1 overflow-y-auto">
            <QuestionNavigator
              sections={test.sections}
              stateOf={stateOf}
              onJump={jumpTo}
            />
          </div>
        </aside>
      </div>

      {confirmOpen ? (
        <ConfirmSubmit
          onCancel={() => setConfirmOpen(false)}
          onConfirm={() => void doSubmit()}
          busy={submitting}
        />
      ) : null}
    </div>
  );
}

/** One question group: instruction, optional reference list, then the fields. */
function GroupBlock({
  group,
  answers,
  onChange,
  disabled,
}: {
  group: ExamQuestionGroup;
  answers: Record<string, string>;
  onChange: (questionId: string, value: string) => void;
  disabled: boolean;
}) {
  const referenceList =
    group.options && !Array.isArray(group.options)
      ? Object.entries(group.options)
      : null;

  return (
    <section className="space-y-3">
      <p className="text-sm font-semibold text-muted-foreground">
        {group.instruction}
      </p>
      {referenceList ? (
        <ul className="rounded-lg border border-border bg-secondary/40 p-3 text-sm text-foreground">
          {referenceList.map(([k, v]) => (
            <li key={k}>
              <span className="font-semibold">{k}</span> — {v}
            </li>
          ))}
        </ul>
      ) : null}
      {group.questions.map((q) => (
        <QuestionField
          key={q.id}
          question={q}
          group={group}
          value={answers[q.id] ?? ""}
          onChange={(v) => onChange(q.id, v)}
          disabled={disabled}
        />
      ))}
    </section>
  );
}

function ConfirmSubmit({
  onCancel,
  onConfirm,
  busy,
}: {
  onCancel: () => void;
  onConfirm: () => void;
  busy: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-xl">
        <h3 className="text-lg font-bold text-foreground">Nộp bài?</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Sau khi nộp bạn không thể sửa đáp án. Bài Nghe/Đọc sẽ được chấm ngay.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onCancel} disabled={busy}>
            Quay lại
          </Button>
          <Button size="sm" onClick={onConfirm} disabled={busy}>
            {busy ? "Đang nộp…" : "Nộp bài"}
          </Button>
        </div>
      </div>
    </div>
  );
}
