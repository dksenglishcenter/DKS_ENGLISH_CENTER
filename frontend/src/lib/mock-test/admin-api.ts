import { apiFetch } from "@/lib/api/client";
import type { ExamSkill } from "./types";

export type AdminExam = {
  id: string;
  code: string;
  title: string;
  skill: ExamSkill;
  durationMinutes: number;
  isPublished: boolean;
  audioUrl: string | null;
  createdAt: string;
  questionCount: number;
};

export async function listAllExams() {
  const { tests } = await apiFetch<{ tests: AdminExam[] }>(
    "/mock-tests/admin",
    { method: "GET" },
  );
  return tests;
}

export function importExam(payload: unknown) {
  return apiFetch<{ message: string; test: { id: string; code: string; title: string } }>(
    "/mock-tests/admin/import",
    { method: "POST", json: payload },
  );
}

export function setExamPublished(id: string, isPublished: boolean) {
  return apiFetch(`/mock-tests/admin/${id}/publish`, {
    method: "PATCH",
    json: { isPublished },
  });
}

export function deleteExam(id: string) {
  return apiFetch(`/mock-tests/admin/${id}`, { method: "DELETE" });
}

export async function uploadExamAudio(file: File) {
  const form = new FormData();
  form.append("file", file);
  return apiFetch<{ url: string; publicId: string }>("/media/upload-audio", {
    method: "POST",
    body: form,
  });
}

export function setExamAudio(id: string, audioUrl: string) {
  return apiFetch(`/mock-tests/admin/${id}/audio`, {
    method: "PATCH",
    json: { audioUrl },
  });
}

// ── Grading queue ────────────────────────────────────────────────────

export type PendingSubmission = {
  id: string;
  kind: "writing" | "speaking";
  title: string;
  student: string;
  createdAt: string;
};

type SubmissionTask = {
  no: number;
  prompt: string;
};

export type WritingSubmissionDetail = {
  id: string;
  responseText: string;
  band: string | null;
  feedback: string | null;
  sampleAnswer: string | null;
  status: string;
  tasks: SubmissionTask[];
  testTitle: string;
};

export type SpeakingSubmissionDetail = {
  id: string;
  audioUrl: string;
  band: string | null;
  feedback: string | null;
  status: string;
  tasks: SubmissionTask[];
  testTitle: string;
};

/** Flatten the nested submission payload into what the grading UI needs. */
function toTasks(submission: {
  attempt: { test: { title: string; sections: { groups: { questions: SubmissionTask[] }[] }[] } };
}): { tasks: SubmissionTask[]; testTitle: string } {
  const tasks = submission.attempt.test.sections.flatMap((s) =>
    s.groups.flatMap((g) => g.questions.map((q) => ({ no: q.no, prompt: q.prompt }))),
  );
  return { tasks, testTitle: submission.attempt.test.title };
}

export async function listPendingSubmissions() {
  return apiFetch<{
    writing: PendingSubmission[];
    speaking: PendingSubmission[];
  }>("/mock-tests/admin/submissions", { method: "GET" });
}

export async function getWritingSubmission(
  id: string,
): Promise<WritingSubmissionDetail> {
  const { submission } = await apiFetch<{ submission: any }>(
    `/mock-tests/admin/submissions/writing/${id}`,
    { method: "GET" },
  );
  return {
    id: submission.id,
    responseText: submission.responseText,
    band: submission.band,
    feedback: submission.feedback,
    sampleAnswer: submission.sampleAnswer,
    status: submission.status,
    ...toTasks(submission),
  };
}

export async function getSpeakingSubmission(
  id: string,
): Promise<SpeakingSubmissionDetail> {
  const { submission } = await apiFetch<{ submission: any }>(
    `/mock-tests/admin/submissions/speaking/${id}`,
    { method: "GET" },
  );
  return {
    id: submission.id,
    audioUrl: submission.audioUrl,
    band: submission.band,
    feedback: submission.feedback,
    status: submission.status,
    ...toTasks(submission),
  };
}

export function gradeWriting(
  id: string,
  dto: { band?: string; feedback?: string; sampleAnswer?: string },
) {
  return apiFetch(`/mock-tests/admin/submissions/writing/${id}`, {
    method: "PATCH",
    json: dto,
  });
}

export function gradeSpeaking(
  id: string,
  dto: { band?: string; feedback?: string },
) {
  return apiFetch(`/mock-tests/admin/submissions/speaking/${id}`, {
    method: "PATCH",
    json: dto,
  });
}
