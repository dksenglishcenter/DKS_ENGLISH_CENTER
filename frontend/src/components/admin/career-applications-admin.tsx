"use client";

import { useEffect, useRef, useState } from "react";
import {
  BriefcaseBusiness,
  ChevronLeft,
  ChevronRight,
  FileUser,
  Mail,
  Phone,
  RefreshCw,
  Search,
  X,
} from "lucide-react";

import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  deleteCareerApplication,
  listCareerApplications,
} from "@/lib/careers/api";
import type {
  CareerApplication,
  CareerApplicationsMeta,
} from "@/lib/careers/types";
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

type ApplicationActionsProps = {
  application: CareerApplication;
  disabled: boolean;
  onDelete: (
    application: CareerApplication,
    trigger: HTMLButtonElement,
  ) => void;
};

function ApplicationActions({
  application,
  disabled,
  onDelete,
}: ApplicationActionsProps) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={disabled}
      aria-label={`Xóa đơn ứng tuyển của ${application.fullName}`}
      onClick={(event) => onDelete(application, event.currentTarget)}
    >
      Xóa
    </Button>
  );
}

export function CareerApplicationsAdmin() {
  const [applications, setApplications] = useState<CareerApplication[]>([]);
  const [meta, setMeta] = useState<CareerApplicationsMeta | null>(null);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CareerApplication | null>(
    null,
  );
  const [deleting, setDeleting] = useState(false);
  const deleteTriggerRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    listCareerApplications({
      page,
      pageSize: PAGE_SIZE,
      search: search || undefined,
      signal: controller.signal,
    })
      .then((response) => {
        setApplications(response.data);
        setMeta(response.meta);
        setListError(null);
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

  function openDeleteDialog(
    application: CareerApplication,
    trigger: HTMLButtonElement,
  ) {
    deleteTriggerRef.current = trigger;
    setDeleteTarget(application);
  }

  function closeDeleteDialog() {
    if (!deleting) setDeleteTarget(null);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    setListError(null);

    try {
      await deleteCareerApplication(deleteTarget.id);
      setDeleteTarget(null);
      setLoading(true);
      if (applications.length === 1 && page > 1) {
        setPage((current) => current - 1);
      } else {
        setReloadKey((current) => current + 1);
      }
    } catch (error) {
      setListError(formatError(error));
    } finally {
      setDeleting(false);
    }
  }

  const totalItems = meta?.totalItems ?? 0;
  const totalPages = meta?.totalPages ?? 0;
  const visiblePages = getVisiblePages(page, totalPages);

  return (
    <section
      aria-labelledby="career-applications-title"
      className="flex flex-col gap-5"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1
            id="career-applications-title"
            className="text-xl font-black text-[#4A2306] font-[family-name:var(--font-nunito)]"
          >
            Đơn ứng tuyển
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-[#9B6B50]">
            Danh sách ứng viên gửi từ biểu mẫu tại trang Tuyển dụng.
          </p>
        </div>

        <form
          onSubmit={handleSearch}
          role="search"
          className="flex w-full gap-2 lg:max-w-xl"
        >
          <label htmlFor="career-application-search" className="sr-only">
            Tìm đơn ứng tuyển
          </label>
          <Input
            id="career-application-search"
            type="search"
            value={searchInput}
            maxLength={100}
            className="bg-white"
            placeholder="Tìm tên, điện thoại, email, vị trí..."
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
            <Search data-icon="inline-start" aria-hidden="true" />
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
            ? "Đang tải đơn ứng tuyển..."
            : `${totalItems.toLocaleString("vi-VN")} đơn${search ? ` cho “${search}”` : ""}`}
        </div>

        {!loading && !listError && applications.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-5 py-12 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-secondary text-primary">
              <FileUser className="size-6" aria-hidden="true" />
            </span>
            <div>
              <p className="font-bold text-[#4A2306]">Chưa có đơn ứng tuyển</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {search
                  ? "Không tìm thấy kết quả phù hợp với từ khóa."
                  : "Thông tin ứng viên gửi từ form sẽ xuất hiện tại đây."}
              </p>
            </div>
          </div>
        ) : null}

        {applications.length > 0 ? (
          <>
            <div className="hidden overflow-x-auto xl:block">
              <table className="w-full table-fixed text-left text-sm">
                <thead className="border-b border-border bg-[#FFF9F5] text-[#9B6B50]">
                  <tr>
                    <th scope="col" className="w-[16%] px-4 py-3 font-semibold">
                      Ứng viên
                    </th>
                    <th scope="col" className="w-[20%] px-4 py-3 font-semibold">
                      Liên hệ
                    </th>
                    <th scope="col" className="w-[19%] px-4 py-3 font-semibold">
                      Vị trí ứng tuyển
                    </th>
                    <th scope="col" className="w-[27%] px-4 py-3 font-semibold">
                      Giới thiệu
                    </th>
                    <th scope="col" className="w-[11%] px-4 py-3 font-semibold">
                      Ngày gửi
                    </th>
                    <th
                      scope="col"
                      className="w-[7%] px-4 py-3 text-center font-semibold"
                    >
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {applications.map((application) => (
                    <tr
                      key={application.id}
                      className="align-top transition-colors hover:bg-[#FFF9F5]/70"
                    >
                      <td className="px-4 py-4 font-semibold text-[#4A2306]">
                        {application.fullName}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-col gap-2">
                          <a
                            href={`tel:${application.phone}`}
                            className="flex items-center gap-2 break-all text-[#6B3E26] hover:text-primary"
                          >
                            <Phone
                              className="size-4 shrink-0"
                              aria-hidden="true"
                            />
                            {application.phone}
                          </a>
                          <a
                            href={`mailto:${application.email}`}
                            className="flex items-center gap-2 break-all text-[#6B3E26] hover:text-primary"
                          >
                            <Mail
                              className="size-4 shrink-0"
                              aria-hidden="true"
                            />
                            {application.email}
                          </a>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-[#6B3E26]">
                        <span className="flex items-start gap-2">
                          <BriefcaseBusiness
                            className="mt-0.5 size-4 shrink-0 text-primary"
                            aria-hidden="true"
                          />
                          <span className="break-words">
                            {application.position}
                          </span>
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-pre-wrap [overflow-wrap:anywhere] text-[#6B3E26]">
                        {application.introduction || "Không cung cấp"}
                      </td>
                      <td className="px-4 py-4 text-xs leading-relaxed text-muted-foreground">
                        {formatSubmittedAt(application.createdAt)}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <ApplicationActions
                          application={application}
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
              {applications.map((application) => (
                <article
                  key={application.id}
                  className="flex min-w-0 flex-col gap-4 p-4 sm:p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="break-words font-bold text-[#4A2306]">
                        {application.fullName}
                      </h2>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatSubmittedAt(application.createdAt)}
                      </p>
                    </div>
                    <ApplicationActions
                      application={application}
                      disabled={deleting}
                      onDelete={openDeleteDialog}
                    />
                  </div>
                  <div className="flex min-w-0 flex-col gap-2 text-sm">
                    <a
                      href={`tel:${application.phone}`}
                      className="flex min-w-0 items-center gap-2 text-[#6B3E26] hover:text-primary"
                    >
                      <Phone className="size-4 shrink-0" aria-hidden="true" />
                      <span className="break-all">{application.phone}</span>
                    </a>
                    <a
                      href={`mailto:${application.email}`}
                      className="flex min-w-0 items-center gap-2 text-[#6B3E26] hover:text-primary"
                    >
                      <Mail className="size-4 shrink-0" aria-hidden="true" />
                      <span className="break-all">{application.email}</span>
                    </a>
                  </div>
                  <dl className="grid gap-3 text-sm">
                    <div>
                      <dt className="font-semibold text-[#4A2306]">
                        Vị trí ứng tuyển
                      </dt>
                      <dd className="mt-1 break-words text-[#6B3E26]">
                        {application.position}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-[#4A2306]">
                        Giới thiệu
                      </dt>
                      <dd className="mt-1 whitespace-pre-wrap [overflow-wrap:anywhere] text-[#6B3E26]">
                        {application.introduction || "Không cung cấp"}
                      </dd>
                    </div>
                  </dl>
                </article>
              ))}
            </div>
          </>
        ) : null}

        {meta && totalPages > 1 ? (
          <nav
            aria-label="Phân trang đơn ứng tuyển"
            className="flex justify-center border-t border-border px-4 py-4 sm:px-5"
          >
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="size-10 p-0"
                aria-label="Trang trước"
                disabled={loading || page <= 1}
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
                disabled={loading || page >= totalPages}
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
        title="Xóa đơn ứng tuyển?"
        description={
          deleteTarget
            ? `Đơn ứng tuyển của ${deleteTarget.fullName} sẽ bị xóa vĩnh viễn và không thể khôi phục.`
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
