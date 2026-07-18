"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Mail,
  Phone,
  RefreshCw,
  Search,
  X,
  type LucideIcon,
} from "lucide-react";

import { AdminPagination } from "@/components/admin/admin-pagination";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatAdminDateTime } from "@/lib/admin/format";
import { ApiError, formatError } from "@/lib/errors/format-error";

const PAGE_SIZE = 10;

/** Link gọi điện — icon căn theo dòng đầu để thẳng hàng với các cột bên cạnh. */
export function PhoneLink({ phone }: { phone: string }) {
  return (
    <a
      href={`tel:${phone}`}
      className="flex min-w-0 items-start gap-2 text-muted-foreground hover:text-primary"
    >
      <Phone className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <span className="break-all">{phone}</span>
    </a>
  );
}

/** Link email — icon căn theo dòng đầu, có fallback khi không có email. */
export function EmailLink({ email }: { email: string | null }) {
  if (!email) {
    return <span className="text-muted-foreground">Không có email</span>;
  }
  return (
    <a
      href={`mailto:${email}`}
      className="flex min-w-0 items-start gap-2 text-muted-foreground hover:text-primary"
    >
      <Mail className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <span className="break-all">{email}</span>
    </a>
  );
}

type SubmissionItem = {
  id: string;
  fullName: string;
  createdAt: string;
};

type SubmissionsMeta = {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
};

export type SubmissionColumn<T> = {
  key: string;
  header: string;
  /** Độ rộng cột ở bảng desktop, vd "w-[14%]". */
  widthClass: string;
  render: (item: T) => ReactNode;
};

export type SubmissionsListConfig<T extends SubmissionItem> = {
  /** Tiền tố cho các id aria (vd "contact-submissions"). */
  idPrefix: string;
  title: string;
  description: string;
  searchLabel: string;
  searchPlaceholder: string;
  /** Đơn vị đếm hiển thị trên đầu bảng (vd "yêu cầu", "đơn"). */
  unitLabel: string;
  loadingText: string;
  nameHeader: string;
  emptyIcon: LucideIcon;
  emptyTitle: string;
  emptyDescription: string;
  paginationLabel: string;
  deleteTitle: string;
  deleteDescription: (item: T) => string;
  deleteAriaLabel: (item: T) => string;
  columns: Array<SubmissionColumn<T>>;
  list: (params: {
    page: number;
    pageSize: number;
    search?: string;
    signal?: AbortSignal;
  }) => Promise<{ data: T[]; meta: SubmissionsMeta }>;
  remove: (id: string) => Promise<unknown>;
};

/**
 * Bảng admin dùng chung cho dữ liệu form khách gửi về (tư vấn, ứng tuyển...):
 * tìm kiếm, phân trang, bảng desktop + card mobile, xóa có xác nhận.
 */
export function SubmissionsListAdmin<T extends SubmissionItem>({
  config,
}: {
  config: SubmissionsListConfig<T>;
}) {
  const [items, setItems] = useState<T[]>([]);
  const [meta, setMeta] = useState<SubmissionsMeta | null>(null);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<T | null>(null);
  const [deleting, setDeleting] = useState(false);
  const deleteTriggerRef = useRef<HTMLButtonElement | null>(null);

  const { list, remove } = config;

  useEffect(() => {
    const controller = new AbortController();

    list({
      page,
      pageSize: PAGE_SIZE,
      search: search || undefined,
      signal: controller.signal,
    })
      .then((response) => {
        setItems(response.data);
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
  }, [list, page, reloadKey, search]);

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

  function openDeleteDialog(item: T, trigger: HTMLButtonElement) {
    deleteTriggerRef.current = trigger;
    setDeleteTarget(item);
  }

  function closeDeleteDialog() {
    if (!deleting) setDeleteTarget(null);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    setListError(null);

    try {
      await remove(deleteTarget.id);
      setDeleteTarget(null);
      setLoading(true);
      if (items.length === 1 && page > 1) {
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
  const titleId = `${config.idPrefix}-title`;
  const searchId = `${config.idPrefix}-search`;
  const EmptyIcon = config.emptyIcon;

  function renderDeleteButton(item: T) {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={deleting}
        aria-label={config.deleteAriaLabel(item)}
        onClick={(event) => openDeleteDialog(item, event.currentTarget)}
      >
        Xóa
      </Button>
    );
  }

  return (
    <section aria-labelledby={titleId} className="flex flex-col gap-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1
            id={titleId}
            className="text-xl font-black text-foreground font-[family-name:var(--font-nunito)]"
          >
            {config.title}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {config.description}
          </p>
        </div>

        <form
          onSubmit={handleSearch}
          role="search"
          className="flex w-full gap-2 lg:w-[28rem] lg:shrink-0"
        >
          <label htmlFor={searchId} className="sr-only">
            {config.searchLabel}
          </label>
          <Input
            id={searchId}
            type="search"
            value={searchInput}
            maxLength={100}
            className="h-10 min-w-0 px-3 py-2 text-sm bg-card"
            placeholder={config.searchPlaceholder}
            onChange={(event) => setSearchInput(event.target.value)}
          />
          {searchInput || search ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="size-10 min-h-10 shrink-0 p-0"
              aria-label="Xóa nội dung tìm kiếm"
              onClick={clearSearch}
            >
              <X aria-hidden="true" />
            </Button>
          ) : null}
          <Button
            type="submit"
            size="sm"
            className="shrink-0 px-3"
            disabled={loading}
          >
            <Search
              data-icon="inline-start"
              className="size-4"
              aria-hidden="true"
            />
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
        className="overflow-hidden rounded-2xl border border-border bg-card shadow-[0_4px_24px_rgba(74,35,6,0.04)]"
        aria-busy={loading}
      >
        <div className="border-b border-border bg-muted px-4 py-3 text-sm text-muted-foreground sm:px-5">
          {loading
            ? config.loadingText
            : `${totalItems.toLocaleString("vi-VN")} ${config.unitLabel}${search ? ` cho “${search}”` : ""}`}
        </div>

        {!loading && !listError && items.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-5 py-12 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-secondary text-primary">
              <EmptyIcon className="size-6" aria-hidden="true" />
            </span>
            <div>
              <p className="font-bold text-foreground">{config.emptyTitle}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {search
                  ? "Không tìm thấy kết quả phù hợp với từ khóa."
                  : config.emptyDescription}
              </p>
            </div>
          </div>
        ) : null}

        {items.length > 0 ? (
          <>
            <div className="hidden overflow-x-auto xl:block">
              <table className="w-full table-fixed text-left text-sm">
                <thead className="border-b border-border bg-muted text-muted-foreground">
                  <tr>
                    <th scope="col" className="w-[15%] px-4 py-3 font-semibold">
                      {config.nameHeader}
                    </th>
                    {config.columns.map((column) => (
                      <th
                        scope="col"
                        key={column.key}
                        className={`${column.widthClass} px-4 py-3 font-semibold`}
                      >
                        {column.header}
                      </th>
                    ))}
                    <th scope="col" className="w-[11%] px-4 py-3 font-semibold">
                      Ngày gửi
                    </th>
                    <th
                      scope="col"
                      className="w-[6%] px-4 py-3 text-center font-semibold"
                    >
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {items.map((item) => (
                    <tr
                      key={item.id}
                      className="align-top transition-colors hover:bg-muted/70"
                    >
                      <td className="break-words px-4 py-4 font-semibold text-foreground">
                        {item.fullName}
                      </td>
                      {config.columns.map((column) => (
                        <td key={column.key} className="px-4 py-4">
                          {column.render(item)}
                        </td>
                      ))}
                      <td className="px-4 py-4 leading-relaxed text-muted-foreground">
                        {formatAdminDateTime(item.createdAt)}
                      </td>
                      <td className="px-4 py-4 text-center">
                        {renderDeleteButton(item)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-border xl:hidden">
              {items.map((item) => (
                <article
                  key={item.id}
                  className="flex min-w-0 flex-col gap-4 p-4 sm:p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="break-words font-bold text-foreground">
                        {item.fullName}
                      </h2>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatAdminDateTime(item.createdAt)}
                      </p>
                    </div>
                    {renderDeleteButton(item)}
                  </div>
                  <dl className="grid gap-3 text-sm sm:grid-cols-2">
                    {config.columns.map((column) => (
                      <div key={column.key} className="min-w-0">
                        <dt className="font-semibold text-foreground">
                          {column.header}
                        </dt>
                        <dd className="mt-1">{column.render(item)}</dd>
                      </div>
                    ))}
                  </dl>
                </article>
              ))}
            </div>
          </>
        ) : null}

        <AdminPagination
          page={page}
          totalPages={meta?.totalPages ?? 0}
          loading={loading}
          ariaLabel={config.paginationLabel}
          onPageChange={(nextPage) => {
            setLoading(true);
            setPage(nextPage);
          }}
        />
      </div>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title={config.deleteTitle}
        description={deleteTarget ? config.deleteDescription(deleteTarget) : ""}
        busy={deleting}
        returnFocusRef={deleteTriggerRef}
        onCancel={closeDeleteDialog}
        onConfirm={() => void handleDelete()}
      />
    </section>
  );
}
