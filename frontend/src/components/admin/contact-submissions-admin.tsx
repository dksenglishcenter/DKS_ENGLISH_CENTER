"use client";

import { useEffect, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Inbox,
  Mail,
  Phone,
  RefreshCw,
  Search as SearchIcon,
  X,
} from "lucide-react";

import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  deleteContactSubmission,
  listContactSubmissions,
} from "@/lib/contact/api";
import type {
  ContactSubmission,
  ContactSubmissionsMeta,
} from "@/lib/contact/types";
import { ApiError, formatError } from "@/lib/errors/format-error";

const PAGE_SIZE = 10;
const DATE_FORMATTER = new Intl.DateTimeFormat("vi-VN", {
  dateStyle: "short",
  timeStyle: "short",
});

function formatSubmittedAt(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Không rõ"
    : DATE_FORMATTER.format(date);
}

function getVisiblePages(page: number, totalPages: number) {
  const pages = new Set([1, totalPages, page - 1, page, page + 1]);
  return [...pages]
    .filter((item) => item >= 1 && item <= totalPages)
    .sort((a, b) => a - b);
}

function SubmissionActions({
  submission,
  disabled,
  onDelete,
}: {
  submission: ContactSubmission;
  disabled: boolean;
  onDelete: (
    submission: ContactSubmission,
    trigger: HTMLButtonElement,
  ) => void;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={disabled}
      aria-label={`Xóa yêu cầu tư vấn của ${submission.fullName}`}
      onClick={(event) => onDelete(submission, event.currentTarget)}
    >
      Xóa
    </Button>
  );
}

export function ContactSubmissionsAdmin() {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [meta, setMeta] = useState<ContactSubmissionsMeta | null>(null);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ContactSubmission | null>(
    null,
  );
  const [deleting, setDeleting] = useState(false);
  const deleteTriggerRef = useRef<HTMLButtonElement | null>(null);

  function openDeleteDialog(
    submission: ContactSubmission,
    trigger: HTMLButtonElement,
  ) {
    deleteTriggerRef.current = trigger;
    setDeleteTarget(submission);
  }

  function closeDeleteDialog() {
    if (deleting) return;
    setDeleteTarget(null);
  }

  useEffect(() => {
    const controller = new AbortController();

    listContactSubmissions({
      page,
      pageSize: PAGE_SIZE,
      search: search || undefined,
      signal: controller.signal,
    })
      .then((response) => {
        setSubmissions(response.data);
        setMeta(response.meta);
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError")
          return;
        if (error instanceof ApiError && error.status === 400 && page > 1) {
          setPage((current) => current - 1);
          return;
        }
        setListError(formatError(error));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [page, reloadKey, search]);

  function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextSearch = searchInput.trim();
    setLoading(true);
    setListError(null);
    if (page === 1 && search === nextSearch) {
      setReloadKey((current) => current + 1);
      return;
    }
    setSearch(nextSearch);
    setPage(1);
  }

  function clearSearch() {
    setLoading(true);
    setListError(null);
    setSearchInput("");
    if (page === 1 && !search) {
      setReloadKey((current) => current + 1);
      return;
    }
    setSearch("");
    setPage(1);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    setListError(null);

    try {
      await deleteContactSubmission(deleteTarget.id);
      setDeleteTarget(null);
      if (submissions.length === 1 && page > 1) {
        setLoading(true);
        setPage((current) => current - 1);
      } else {
        setLoading(true);
        setReloadKey((current) => current + 1);
      }
    } catch (error) {
      setListError(formatError(error));
    } finally {
      setDeleting(false);
    }
  }

  const totalItems = meta?.totalItems ?? 0;
  const visiblePages = getVisiblePages(page, meta?.totalPages ?? 0);

  return (
    <section
      aria-labelledby="contact-submissions-title"
      className="flex flex-col gap-5"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2
            id="contact-submissions-title"
            className="text-xl font-black text-[#4A2306] font-[family-name:var(--font-nunito)]"
          >
            Yêu cầu nhận tư vấn
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-[#9B6B50]">
            Danh sách thông tin khách hàng gửi từ biểu mẫu tại trang Liên hệ.
          </p>
        </div>

        <form
          onSubmit={handleSearch}
          role="search"
          className="flex w-full gap-2 lg:max-w-xl"
        >
          <label htmlFor="contact-submission-search" className="sr-only">
            Tìm yêu cầu tư vấn
          </label>
          <Input
            id="contact-submission-search"
            type="search"
            value={searchInput}
            maxLength={100}
            className="bg-white"
            placeholder="Tìm tên, điện thoại, email, khóa học..."
            onChange={(event) => setSearchInput(event.target.value)}
          />
          {searchInput || search ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              aria-label="Xóa nội dung tìm kiếm"
              onClick={clearSearch}
            >
              <X aria-hidden="true" />
            </Button>
          ) : null}
          <Button type="submit" size="sm" disabled={loading}>
            <SearchIcon data-icon="inline-start" aria-hidden="true" />
            Tìm
          </Button>
        </form>
      </div>

      {listError ? (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <span>{listError}</span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setLoading(true);
              setListError(null);
              setReloadKey((current) => current + 1);
            }}
          >
            <RefreshCw data-icon="inline-start" aria-hidden="true" />
            Thử lại
          </Button>
        </div>
      ) : null}

      <div
        className="overflow-hidden rounded-2xl border border-border bg-white shadow-[0_4px_24px_rgba(74,35,6,0.04)]"
        aria-busy={loading}
      >
        <div className="border-b border-border bg-[#FFF9F5] px-4 py-3 text-sm text-[#6B3E26] sm:px-5">
          {loading
            ? "Đang tải yêu cầu tư vấn..."
            : `${totalItems.toLocaleString("vi-VN")} yêu cầu${search ? ` cho “${search}”` : ""}`}
        </div>

        {!loading && !listError && submissions.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-5 py-12 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-secondary text-primary">
              <Inbox className="size-6" aria-hidden="true" />
            </span>
            <div>
              <p className="font-bold text-[#4A2306]">Chưa có yêu cầu tư vấn</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {search
                  ? "Không tìm thấy kết quả phù hợp với từ khóa."
                  : "Dữ liệu khách hàng gửi từ form sẽ xuất hiện tại đây."}
              </p>
            </div>
          </div>
        ) : null}

        {submissions.length > 0 ? (
          <>
            <div className="hidden overflow-x-auto xl:block">
              <table className="w-full table-fixed text-left text-sm">
                <thead className="border-b border-border bg-[#FFF9F5] text-[#9B6B50]">
                  <tr>
                    <th scope="col" className="w-[17%] px-4 py-3 font-semibold">
                      Khách hàng
                    </th>
                    <th scope="col" className="w-[19%] px-4 py-3 font-semibold">
                      Liên hệ
                    </th>
                    <th scope="col" className="w-[17%] px-4 py-3 font-semibold">
                      Khóa quan tâm
                    </th>
                    <th scope="col" className="w-[27%] px-4 py-3 font-semibold">
                      Nhu cầu học tập
                    </th>
                    <th scope="col" className="w-[12%] px-4 py-3 font-semibold">
                      Ngày gửi
                    </th>
                    <th
                      scope="col"
                      className="w-[8%] px-4 py-3 text-center font-semibold"
                    >
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {submissions.map((submission) => (
                    <tr
                      key={submission.id}
                      className="align-top transition-colors hover:bg-[#FFF9F5]/70"
                    >
                      <td className="px-4 py-4 font-semibold text-[#4A2306]">
                        {submission.fullName}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-col gap-2">
                          <a
                            href={`tel:${submission.phone}`}
                            className="flex items-center gap-2 break-all text-[#6B3E26] hover:text-primary"
                          >
                            <Phone
                              className="size-4 shrink-0"
                              aria-hidden="true"
                            />
                            {submission.phone}
                          </a>
                          {submission.email ? (
                            <a
                              href={`mailto:${submission.email}`}
                              className="flex items-center gap-2 break-all text-[#6B3E26] hover:text-primary"
                            >
                              <Mail
                                className="size-4 shrink-0"
                                aria-hidden="true"
                              />
                              {submission.email}
                            </a>
                          ) : (
                            <span className="text-muted-foreground">
                              Không có email
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-[#6B3E26]">
                        {submission.courseInterest}
                      </td>
                      <td className="px-4 py-4 whitespace-pre-wrap [overflow-wrap:anywhere] text-[#6B3E26]">
                        {submission.learningNeeds || (
                          <span className="text-muted-foreground">
                            Không cung cấp
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-xs leading-relaxed text-muted-foreground">
                        {formatSubmittedAt(submission.createdAt)}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <SubmissionActions
                          submission={submission}
                          disabled={deleting}
                          onDelete={openDeleteDialog}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-border xl:hidden">
              {submissions.map((submission) => (
                <article
                  key={submission.id}
                  className="flex min-w-0 flex-col gap-4 p-4 sm:p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="break-words font-bold text-[#4A2306]">
                        {submission.fullName}
                      </h3>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatSubmittedAt(submission.createdAt)}
                      </p>
                    </div>
                    <SubmissionActions
                      submission={submission}
                      disabled={deleting}
                      onDelete={openDeleteDialog}
                    />
                  </div>
                  <div className="min-w-0 flex flex-col gap-2 text-sm">
                    <a
                      href={`tel:${submission.phone}`}
                      className="flex min-w-0 items-center gap-2 text-[#6B3E26] hover:text-primary"
                    >
                      <Phone className="size-4 shrink-0" aria-hidden="true" />
                      <span className="break-all">{submission.phone}</span>
                    </a>
                    {submission.email ? (
                      <a
                        href={`mailto:${submission.email}`}
                        className="flex min-w-0 items-center gap-2 text-[#6B3E26] hover:text-primary"
                      >
                        <Mail className="size-4 shrink-0" aria-hidden="true" />
                        <span className="break-all">{submission.email}</span>
                      </a>
                    ) : null}
                  </div>
                  <dl className="grid gap-3 text-sm">
                    <div>
                      <dt className="font-semibold text-[#4A2306]">
                        Khóa quan tâm
                      </dt>
                      <dd className="mt-1 break-words text-[#6B3E26]">
                        {submission.courseInterest}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-[#4A2306]">
                        Nhu cầu học tập
                      </dt>
                      <dd className="mt-1 whitespace-pre-wrap [overflow-wrap:anywhere] text-[#6B3E26]">
                        {submission.learningNeeds || "Không cung cấp"}
                      </dd>
                    </div>
                  </dl>
                </article>
              ))}
            </div>
          </>
        ) : null}

        {meta && meta.totalPages > 1 ? (
          <nav
            aria-label="Phân trang yêu cầu tư vấn"
            className="flex justify-center border-t border-border px-4 py-4 sm:px-5"
          >
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="size-10 p-0"
                aria-label="Trang trước"
                disabled={loading || meta.currentPage <= 1}
                onClick={() => {
                  setLoading(true);
                  setPage((current) => current - 1);
                }}
              >
                <ChevronLeft aria-hidden="true" />
              </Button>
              {visiblePages.map((pageNumber, index) => {
                const previousPage = visiblePages[index - 1];
                return (
                  <span key={pageNumber} className="contents">
                    {previousPage && pageNumber - previousPage > 1 ? (
                      <span
                        aria-hidden="true"
                        className="px-1 text-muted-foreground"
                      >
                        …
                      </span>
                    ) : null}
                    <Button
                      type="button"
                      variant={pageNumber === page ? "primary" : "outline"}
                      size="sm"
                      className="size-10 p-0"
                      aria-current={pageNumber === page ? "page" : undefined}
                      aria-label={`Trang ${pageNumber}`}
                      disabled={loading}
                      onClick={() => {
                        setLoading(true);
                        setPage(pageNumber);
                      }}
                    >
                      {pageNumber}
                    </Button>
                  </span>
                );
              })}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="size-10 p-0"
                aria-label="Trang sau"
                disabled={loading || meta.currentPage >= meta.totalPages}
                onClick={() => {
                  setLoading(true);
                  setPage((current) => current + 1);
                }}
              >
                <ChevronRight aria-hidden="true" />
              </Button>
            </div>
          </nav>
        ) : null}
      </div>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Xóa yêu cầu tư vấn?"
        description={
          deleteTarget
            ? `Yêu cầu của ${deleteTarget.fullName} sẽ bị xóa vĩnh viễn và không thể khôi phục.`
            : ""
        }
        busy={deleting}
        returnFocusRef={deleteTriggerRef}
        onCancel={closeDeleteDialog}
        onConfirm={() => void handleDelete()}
      />
    </section>
  );
}
