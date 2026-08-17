import { apiFetch } from "@/lib/api/client";
import type {
  AttemptResult,
  AttemptState,
  ExamAttempt,
  ExamTest,
  ExamTestSummary,
} from "./types";

export async function listExamTests() {
  const { tests } = await apiFetch<{ tests: ExamTestSummary[] }>("/mock-tests", {
    method: "GET",
  });
  return tests;
}

export async function getExamTest(id: string) {
  const { test } = await apiFetch<{ test: ExamTest }>(`/mock-tests/${id}`, {
    method: "GET",
  });
  return test;
}

export async function startAttempt(testId: string) {
  const { attempt } = await apiFetch<{ attempt: ExamAttempt }>(
    `/mock-tests/${testId}/attempts`,
    { method: "POST" },
  );
  return attempt;
}

export function saveAnswers(
  attemptId: string,
  answers: { questionId: string; value: string }[],
) {
  return apiFetch<{ saved: number }>(
    `/mock-tests/attempts/${attemptId}/answers`,
    { method: "PATCH", json: { answers } },
  );
}

export async function submitAttempt(attemptId: string) {
  const { result } = await apiFetch<{ result: AttemptResult }>(
    `/mock-tests/attempts/${attemptId}/submit`,
    { method: "POST" },
  );
  return result;
}

export function getAttemptState(attemptId: string) {
  return apiFetch<AttemptState>(
    `/mock-tests/attempts/${attemptId}/state`,
    { method: "GET" },
  );
}

export async function submitWriting(attemptId: string, responseText: string) {
  const { result } = await apiFetch<{ result: AttemptResult }>(
    `/mock-tests/attempts/${attemptId}/submit-writing`,
    { method: "POST", json: { responseText } },
  );
  return result;
}

export async function submitSpeaking(attemptId: string, file: File) {
  const form = new FormData();
  form.append("file", file);
  const { result } = await apiFetch<{ result: AttemptResult }>(
    `/mock-tests/attempts/${attemptId}/submit-speaking`,
    { method: "POST", body: form },
  );
  return result;
}

export async function getAttemptResult(attemptId: string) {
  const { result } = await apiFetch<{ result: AttemptResult }>(
    `/mock-tests/attempts/${attemptId}/result`,
    { method: "GET" },
  );
  return result;
}
