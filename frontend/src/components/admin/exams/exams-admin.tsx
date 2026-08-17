"use client";

import { useEffect, useState } from "react";

import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  deleteExam,
  importExam,
  listAllExams,
  setExamPublished,
  type AdminExam,
} from "@/lib/mock-test/admin-api";
import type { ExamSkill } from "@/lib/mock-test/types";
import { formatError } from "@/lib/errors/format-error";

const SKILL_LABEL: Record<ExamSkill, string> = {
  LISTENING: "Nghe",
  READING: "Đọc",
  WRITING: "Viết",
  SPEAKING: "Nói",
};

export function ExamsAdmin() {
  const [exams, setExams] = useState<AdminExam[]>([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminExam | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState("");
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      setExams(await listAllExams());
      setListError(null);
    } catch (err) {
      setListError(formatError(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function togglePublish(exam: AdminExam) {
    setBusyId(exam.id);
    try {
      await setExamPublished(exam.id, !exam.isPublished);
      await load();
    } catch (err) {
      setListError(formatError(err));
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteExam(deleteTarget.id);
      setDeleteTarget(null);
      await load();
    } catch (err) {
      setListError(formatError(err));
    } finally {
      setDeleting(false);
    }
  }

  async function handleImport() {
    setImportError(null);
    let payload: unknown;
    try {
      payload = JSON.parse(importText);
    } catch {
      setImportError("JSON không hợp lệ — kiểm tra lại dấu ngoặc/dấu phẩy.");
      return;
    }
    setImporting(true);
    try {
      await importExam(payload);
      setImportText("");
      setImportOpen(false);
      await load();
    } catch (err) {
      setImportError(formatError(err));
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Đề thi thử</h1>
          <p className="text-muted-foreground">
            Tạo và quản lý đề Nghe / Đọc / Viết / Nói.
          </p>
        </div>
        <Button onClick={() => setImportOpen((v) => !v)}>
          {importOpen ? "Đóng" : "Import đề"}
        </Button>
      </div>

      {importOpen ? (
        <div className="space-y-3 rounded-2xl border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">
            Dán nội dung đề dạng JSON (theo mẫu trong tài liệu hướng dẫn nhập đề).
          </p>
          <Textarea
            className="min-h-56 font-mono text-sm"
            placeholder='{ "code": "...", "title": "...", "skill": "READING", "durationMinutes": 60, "sections": [ ... ] }'
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
          />
          {importError ? (
            <p className="text-sm text-red-600">{importError}</p>
          ) : null}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setImportOpen(false)}
              disabled={importing}
            >
              Hủy
            </Button>
            <Button
              size="sm"
              onClick={handleImport}
              disabled={importing || !importText.trim()}
            >
              {importing ? "Đang nhập…" : "Nhập đề"}
            </Button>
          </div>
        </div>
      ) : null}

      {listError ? <p className="text-red-600">{listError}</p> : null}

      <div className="overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-semibold">Đề</th>
              <th className="px-4 py-3 font-semibold">Kỹ năng</th>
              <th className="px-4 py-3 font-semibold">Số câu</th>
              <th className="px-4 py-3 font-semibold">Thời lượng</th>
              <th className="px-4 py-3 font-semibold">Trạng thái</th>
              <th className="px-4 py-3 text-right font-semibold">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  Đang tải…
                </td>
              </tr>
            ) : exams.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  Chưa có đề nào. Bấm "Import đề" để thêm.
                </td>
              </tr>
            ) : (
              exams.map((exam) => (
                <tr key={exam.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-foreground">{exam.title}</div>
                    <div className="text-xs text-muted-foreground">{exam.code}</div>
                  </td>
                  <td className="px-4 py-3">{SKILL_LABEL[exam.skill]}</td>
                  <td className="px-4 py-3">{exam.questionCount}</td>
                  <td className="px-4 py-3">{exam.durationMinutes} phút</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${
                        exam.isPublished
                          ? "bg-green-100 text-green-700"
                          : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {exam.isPublished ? "Đang mở" : "Đang ẩn"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={busyId === exam.id}
                        onClick={() => togglePublish(exam)}
                      >
                        {exam.isPublished ? "Ẩn" : "Mở"}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setDeleteTarget(exam)}
                      >
                        Xóa
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Xóa đề thi?"
        description={`Xóa "${deleteTarget?.title ?? ""}" cùng toàn bộ câu hỏi và lượt thi. Không thể hoàn tác.`}
        busy={deleting}
        onConfirm={handleDelete}
        onCancel={() => (deleting ? undefined : setDeleteTarget(null))}
      />
    </div>
  );
}
