"use client";

import { useEffect, useRef, useState } from "react";
import {
  BriefcaseBusiness,
  CheckCircle2,
  Eye,
  EyeOff,
  MapPin,
  Plus,
  RefreshCw,
  Search,
} from "lucide-react";

import { AdminPagination } from "@/components/admin/admin-pagination";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { JobForm } from "./job-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatAdminDateTime } from "@/lib/admin/format";
import { deleteJob, listAdminJobs, updateJob } from "@/lib/jobs/api";
import { formatJobSalary } from "@/lib/jobs/salary";
import type { Job, JobsPagination, JobStatusFilter } from "@/lib/jobs/types";
import { ApiError, formatError } from "@/lib/errors/format-error";

const PAGE_SIZE = 20;

const STATUS_OPTIONS: Array<{ value: JobStatusFilter; label: string }> = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: "published", label: "Đang công khai" },
  { value: "draft", label: "Đang ẩn" },
];

export function JobsAdmin() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [pagination, setPagination] = useState<JobsPagination | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<JobStatusFilter>("all");
  const [reloadKey, setReloadKey] = useState(0);
  const [formJob, setFormJob] = useState<Job | null | undefined>(undefined);
  const [formSession, setFormSession] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<Job | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const formSectionRef = useRef<HTMLDivElement>(null);
  const deleteTriggerRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    listAdminJobs({
      page,
      pageSize: PAGE_SIZE,
      search: search || undefined,
      status,
      signal: controller.signal,
    })
      .then((response) => {
        setJobs(response.data);
        setPagination(response.meta);
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
  }, [page, reloadKey, search, status]);

  const nextSortOrder = pagination?.nextSortOrder ?? 1;

  function reloadList(successMessage?: string) {
    setLoading(true);
    setListError(null);
    if (successMessage) setMessage(successMessage);
    setReloadKey((current) => current + 1);
  }

  function openForm(job: Job | null) {
    setFormJob(job);
    setFormSession((current) => current + 1);
    setMessage(null);
    window.requestAnimationFrame(() => {
      formSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }

  function closeForm() {
    setFormJob(undefined);
  }

  function handleSaved(successMessage: string) {
    closeForm();
    reloadList(successMessage);
  }

  function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextSearch = searchInput.trim();
    setMessage(null);
    setLoading(true);
    setListError(null);
    if (page !== 1) {
      setSearch(nextSearch);
      setPage(1);
    } else if (nextSearch === search) {
      setReloadKey((current) => current + 1);
    } else {
      setSearch(nextSearch);
      setPage(1);
    }
  }

  function clearFilters() {
    setSearchInput("");
    setSearch("");
    setStatus("all");
    setPage(1);
    setMessage(null);
    reloadList();
  }

  async function togglePublished(job: Job) {
    setTogglingId(job.id);
    setListError(null);
    setMessage(null);
    try {
      const response = await updateJob(job.id, {
        isPublished: !job.isPublished,
      });
      reloadList(response.message);
    } catch (error) {
      setListError(formatError(error));
    } finally {
      setTogglingId(null);
    }
  }

  function openDeleteDialog(job: Job, trigger: HTMLButtonElement) {
    deleteTriggerRef.current = trigger;
    setDeleteTarget(job);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    setListError(null);
    setMessage(null);
    try {
      const response = await deleteJob(deleteTarget.id);
      if (formJob?.id === deleteTarget.id) closeForm();
      setDeleteTarget(null);
      if (jobs.length === 1 && page > 1) {
        setMessage(response.message);
        setLoading(true);
        setPage((current) => current - 1);
      } else {
        reloadList(response.message);
      }
    } catch (error) {
      setListError(formatError(error));
    } finally {
      setDeleting(false);
    }
  }

  const hasActiveFilters = Boolean(search || status !== "all");

  return (
    <section aria-labelledby="jobs-admin-title" className="min-w-0 space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="shrink-0">
          <h1
            id="jobs-admin-title"
            className="text-2xl font-black text-[#4A2306] font-[family-name:var(--font-nunito)]"
          >
            Quản lý tuyển dụng
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-[#9B6B50]">
            Tạo, sắp xếp và kiểm soát trạng thái các vị trí tuyển dụng.
          </p>
        </div>
        <div className="flex min-w-0 flex-col gap-2 rounded-xl border border-border bg-white p-3 shadow-[0_4px_16px_rgba(74,35,6,0.04)] xl:w-auto xl:flex-row xl:items-center xl:border-0 xl:bg-transparent xl:p-0 xl:shadow-none">
          <form
            role="search"
            onSubmit={handleSearch}
            className="grid min-w-0 gap-2 lg:grid-cols-[minmax(16rem,24rem)_11rem_auto] lg:items-center"
          >
            <div>
              <label htmlFor="jobs-search" className="sr-only">
                Tìm vị trí tuyển dụng
              </label>
              <Input
                id="jobs-search"
                type="search"
                value={searchInput}
                maxLength={100}
                className="h-10 min-w-0 bg-white px-3 py-2 text-sm"
                placeholder="Tìm theo vị trí, loại hình, địa điểm..."
                onChange={(event) => setSearchInput(event.target.value)}
              />
            </div>
            <div>
              <label htmlFor="jobs-status" className="sr-only">
                Lọc trạng thái
              </label>
              <select
                id="jobs-status"
                value={status}
                className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm text-[#4A2306] outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary"
                onChange={(event) => {
                  setLoading(true);
                  setListError(null);
                  setMessage(null);
                  setPage(1);
                  setStatus(event.target.value as JobStatusFilter);
                }}
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <Button
                type="submit"
                size="sm"
                className="flex-1 px-3"
                disabled={loading}
              >
                <Search className="size-4" aria-hidden="true" />
                Tìm
              </Button>
              {hasActiveFilters || searchInput ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="px-3"
                  disabled={loading}
                  onClick={clearFilters}
                >
                  Xóa lọc
                </Button>
              ) : null}
            </div>
          </form>
          <Button
            type="button"
            size="sm"
            className="w-full shrink-0 px-3 xl:w-auto"
            onClick={() => openForm(null)}
          >
            <Plus className="size-4" aria-hidden="true" />
            Thêm vị trí
          </Button>
        </div>
      </div>

      {message ? (
        <p
          role="status"
          className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-semibold text-green-700"
        >
          <CheckCircle2 className="size-4 shrink-0" aria-hidden="true" />
          {message}
        </p>
      ) : null}

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
            onClick={() => reloadList()}
          >
            <RefreshCw className="size-4" aria-hidden="true" />
            Thử lại
          </Button>
        </div>
      ) : null}

      <div
        className="min-w-0 overflow-hidden rounded-2xl border border-border bg-white shadow-[0_4px_24px_rgba(74,35,6,0.04)]"
        aria-busy={loading}
      >
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-[#FFF9F5] px-4 py-3 text-sm text-[#6B3E26] sm:px-5">
          <span>
            {loading
              ? "Đang tải vị trí tuyển dụng..."
              : `${(pagination?.totalItems ?? jobs.length).toLocaleString("vi-VN")} vị trí`}
          </span>
          {!loading && hasActiveFilters ? (
            <span className="text-xs text-[#9B6B50]">Đang áp dụng bộ lọc</span>
          ) : null}
        </div>

        {!loading && !listError && jobs.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-5 py-14 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-secondary text-primary">
              <BriefcaseBusiness className="size-6" aria-hidden="true" />
            </span>
            <div>
              <p className="font-bold text-[#4A2306]">
                {hasActiveFilters
                  ? "Không tìm thấy vị trí phù hợp"
                  : "Chưa có vị trí tuyển dụng"}
              </p>
              <p className="mt-1 text-sm text-[#9B6B50]">
                {hasActiveFilters
                  ? "Thử thay đổi từ khóa hoặc trạng thái lọc."
                  : "Tạo vị trí đầu tiên để bắt đầu tuyển dụng."}
              </p>
            </div>
            {!hasActiveFilters ? (
              <Button type="button" size="sm" onClick={() => openForm(null)}>
                <Plus className="size-4" aria-hidden="true" />
                Thêm vị trí
              </Button>
            ) : null}
          </div>
        ) : null}

        {jobs.length > 0 ? (
          <>
            <div className="hidden overflow-x-auto xl:block">
              <table className="w-full table-fixed text-left text-sm">
                <thead className="border-b border-border bg-[#FFF9F5] text-[#9B6B50]">
                  <tr>
                    <th scope="col" className="w-[25%] px-4 py-3 font-semibold">
                      Vị trí
                    </th>
                    <th scope="col" className="w-[13%] px-4 py-3 font-semibold">
                      Loại hình
                    </th>
                    <th scope="col" className="w-[15%] px-4 py-3 font-semibold">
                      Địa điểm
                    </th>
                    <th scope="col" className="w-[9%] px-4 py-3 font-semibold">
                      Thứ tự
                    </th>
                    <th scope="col" className="w-[12%] px-4 py-3 font-semibold">
                      Trạng thái
                    </th>
                    <th
                      scope="col"
                      className="w-[26%] px-4 py-3 text-center font-semibold"
                    >
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {jobs.map((job) => (
                    <JobTableRow
                      key={job.id}
                      job={job}
                      busy={deleting || togglingId === job.id}
                      onEdit={() => openForm(job)}
                      onToggle={() => void togglePublished(job)}
                      onDelete={(trigger) => openDeleteDialog(job, trigger)}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-3 bg-[#FFF9F5]/50 p-3 xl:hidden">
              {jobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  busy={deleting || togglingId === job.id}
                  onEdit={() => openForm(job)}
                  onToggle={() => void togglePublished(job)}
                  onDelete={(trigger) => openDeleteDialog(job, trigger)}
                />
              ))}
            </div>
          </>
        ) : null}

        <AdminPagination
          page={page}
          totalPages={pagination?.totalPages ?? 0}
          loading={loading}
          ariaLabel="Phân trang vị trí tuyển dụng"
          onPageChange={(nextPage) => {
            setLoading(true);
            setPage(nextPage);
          }}
        />
      </div>

      {formJob !== undefined ? (
        <div ref={formSectionRef} className="scroll-mt-6">
          <JobForm
            key={`${formJob?.id ?? "create"}-${formSession}`}
            job={formJob}
            nextSortOrder={nextSortOrder}
            onCancel={closeForm}
            onSaved={handleSaved}
          />
        </div>
      ) : null}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Xóa vị trí tuyển dụng?"
        description={
          deleteTarget
            ? `Vị trí “${deleteTarget.title}” sẽ bị xóa vĩnh viễn và không thể khôi phục.`
            : ""
        }
        busy={deleting}
        returnFocusRef={deleteTriggerRef}
        onCancel={() => {
          if (!deleting) setDeleteTarget(null);
        }}
        onConfirm={() => void handleDelete()}
      />
    </section>
  );
}

type JobItemProps = {
  job: Job;
  busy: boolean;
  onEdit: () => void;
  onToggle: () => void;
  onDelete: (trigger: HTMLButtonElement) => void;
};

function JobStatus({ published }: { published: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${
        published
          ? "bg-green-100 text-green-700"
          : "bg-amber-100 text-amber-800"
      }`}
    >
      {published ? (
        <Eye className="size-3.5" />
      ) : (
        <EyeOff className="size-3.5" />
      )}
      {published ? "Công khai" : "Đang ẩn"}
    </span>
  );
}

function JobActions({ job, busy, onEdit, onToggle, onDelete }: JobItemProps) {
  return (
    <div className="flex flex-wrap gap-2 xl:flex-nowrap xl:justify-center">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="xl:shrink-0"
        disabled={busy}
        onClick={onEdit}
      >
        Sửa
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="xl:shrink-0"
        disabled={busy}
        onClick={onToggle}
      >
        {job.isPublished ? "Ẩn" : "Công khai"}
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="xl:shrink-0"
        disabled={busy}
        aria-label={`Xóa vị trí ${job.title}`}
        onClick={(event) => onDelete(event.currentTarget)}
      >
        Xóa
      </Button>
    </div>
  );
}

function JobTableRow(props: JobItemProps) {
  const { job } = props;
  return (
    <tr className="align-top transition-colors hover:bg-[#FFF9F5]/70">
      <td className="px-4 py-4">
        <p className="font-bold text-[#4A2306]">{job.title}</p>
        <p className="mt-1 line-clamp-1 text-xs text-[#9B6B50]">
          {formatJobSalary(job)}
        </p>
      </td>
      <td className="px-4 py-4 text-[#6B3E26]">{job.type}</td>
      <td className="px-4 py-4 text-[#6B3E26]">{job.location}</td>
      <td className="px-4 py-4 text-[#6B3E26]">{job.sortOrder}</td>
      <td className="px-4 py-4">
        <JobStatus published={job.isPublished} />
      </td>
      <td className="px-4 py-4">
        <JobActions {...props} />
      </td>
    </tr>
  );
}

function JobCard(props: JobItemProps) {
  const { job } = props;
  return (
    <article className="space-y-4 p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="break-words font-black text-[#4A2306]">{job.title}</h2>
          <p className="mt-1 text-sm font-semibold text-primary">
            {formatJobSalary(job)}
          </p>
        </div>
        <JobStatus published={job.isPublished} />
      </div>
      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-[#9B6B50]">
            Loại hình
          </dt>
          <dd className="mt-1 text-[#6B3E26]">{job.type}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-[#9B6B50]">
            Địa điểm
          </dt>
          <dd className="mt-1 flex items-center gap-1 text-[#6B3E26]">
            <MapPin className="size-4 shrink-0" aria-hidden="true" />
            {job.location}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-[#9B6B50]">
            Thứ tự
          </dt>
          <dd className="mt-1 text-[#6B3E26]">{job.sortOrder}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-[#9B6B50]">
            Cập nhật
          </dt>
          <dd className="mt-1 text-[#6B3E26]">
            {formatAdminDateTime(job.updatedAt)}
          </dd>
        </div>
      </dl>
      <JobActions {...props} />
    </article>
  );
}
