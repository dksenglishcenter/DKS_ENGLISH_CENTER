"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  getSpeakingSubmission,
  getWritingSubmission,
  gradeSpeaking,
  gradeWriting,
  listPendingSubmissions,
  type PendingSubmission,
  type SpeakingSubmissionDetail,
  type WritingSubmissionDetail,
} from "@/lib/mock-test/admin-api";
import { formatError } from "@/lib/errors/format-error";

type Detail =
  | ({ kind: "writing" } & WritingSubmissionDetail)
  | ({ kind: "speaking" } & SpeakingSubmissionDetail);

export function ExamGradingAdmin() {
  const [items, setItems] = useState<PendingSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [detail, setDetail] = useState<Detail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [band, setBand] = useState("");
  const [feedback, setFeedback] = useState("");
  const [sampleAnswer, setSampleAnswer] = useState("");
  const [saving, setSaving] = useState(false);

  async function loadQueue() {
    setLoading(true);
    try {
      const { writing, speaking } = await listPendingSubmissions();
      setItems([...writing, ...speaking]);
      setError(null);
    } catch (err) {
      setError(formatError(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadQueue();
  }, []);

  async function open(item: PendingSubmission) {
    setLoadingDetail(true);
    setBand("");
    setFeedback("");
    setSampleAnswer("");
    try {
      const d =
        item.kind === "writing"
          ? { kind: "writing" as const, ...(await getWritingSubmission(item.id)) }
          : { kind: "speaking" as const, ...(await getSpeakingSubmission(item.id)) };
      setDetail(d);
    } catch (err) {
      setError(formatError(err));
    } finally {
      setLoadingDetail(false);
    }
  }

  async function submitGrade() {
    if (!detail) return;
    setSaving(true);
    try {
      if (detail.kind === "writing") {
        await gradeWriting(detail.id, { band, feedback, sampleAnswer });
      } else {
        await gradeSpeaking(detail.id, { band, feedback });
      }
      setDetail(null);
      await loadQueue();
    } catch (err) {
      setError(formatError(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Chấm bài Viết / Nói</h1>
        <p className="text-muted-foreground">
          Bài học viên nộp đang chờ chấm.
        </p>
      </div>

      {error ? <p className="text-red-600">{error}</p> : null}

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        {/* Queue */}
        <div className="space-y-2 rounded-2xl border border-border bg-card p-3">
          {loading ? (
            <p className="p-3 text-muted-foreground">Đang tải…</p>
          ) : items.length === 0 ? (
            <p className="p-3 text-muted-foreground">Không có bài chờ chấm.</p>
          ) : (
            items.map((item) => (
              <button
                key={`${item.kind}-${item.id}`}
                type="button"
                onClick={() => open(item)}
                className={`block w-full rounded-lg border p-3 text-left transition-colors hover:border-primary ${
                  detail?.id === item.id
                    ? "border-primary bg-secondary"
                    : "border-border"
                }`}
              >
                <span className="inline-block rounded-full bg-secondary px-2 py-0.5 text-xs font-semibold text-primary">
                  {item.kind === "writing" ? "Viết" : "Nói"}
                </span>
                <p className="mt-1 font-semibold text-foreground">{item.title}</p>
                <p className="text-sm text-muted-foreground">{item.student}</p>
              </button>
            ))
          )}
        </div>

        {/* Grading panel */}
        <div className="rounded-2xl border border-border bg-card p-5">
          {loadingDetail ? (
            <p className="text-muted-foreground">Đang mở bài…</p>
          ) : !detail ? (
            <p className="text-muted-foreground">Chọn một bài bên trái để chấm.</p>
          ) : (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-bold text-foreground">
                  {detail.testTitle}
                </h2>
                <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                  {detail.tasks.map((t) => (
                    <p key={t.no}>
                      <span className="font-semibold">Phần {t.no}:</span> {t.prompt}
                    </p>
                  ))}
                </div>
              </div>

              {detail.kind === "writing" ? (
                <div>
                  <p className="mb-1 font-semibold text-foreground">Bài làm</p>
                  <div className="max-h-96 overflow-y-auto whitespace-pre-line rounded-lg border border-border bg-background p-3 text-foreground">
                    {detail.responseText}
                  </div>
                </div>
              ) : (
                <div>
                  <p className="mb-2 font-semibold text-foreground">Bài ghi âm</p>
                  {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                  <audio src={detail.audioUrl} controls className="w-full" />
                </div>
              )}

              <div className="space-y-3 border-t border-border pt-4">
                <label className="block text-sm">
                  <span className="mb-1 block font-semibold text-foreground">
                    Band (vd 6.5)
                  </span>
                  <Input
                    className="w-32"
                    value={band}
                    onChange={(e) => setBand(e.target.value)}
                  />
                </label>
                <label className="block text-sm">
                  <span className="mb-1 block font-semibold text-foreground">
                    Nhận xét
                  </span>
                  <Textarea
                    className="min-h-32"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                  />
                </label>
                {detail.kind === "writing" ? (
                  <label className="block text-sm">
                    <span className="mb-1 block font-semibold text-foreground">
                      Bài mẫu (tùy chọn)
                    </span>
                    <Textarea
                      className="min-h-32"
                      value={sampleAnswer}
                      onChange={(e) => setSampleAnswer(e.target.value)}
                    />
                  </label>
                ) : null}
                <div className="flex justify-end">
                  <Button onClick={submitGrade} disabled={saving}>
                    {saving ? "Đang lưu…" : "Lưu điểm & nhận xét"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
