"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";

function getVisiblePages(page: number, totalPages: number) {
  const pages = new Set([1, totalPages, page - 1, page, page + 1]);
  return [...pages]
    .filter((item) => item >= 1 && item <= totalPages)
    .sort((a, b) => a - b);
}

type AdminPaginationProps = {
  page: number;
  totalPages: number;
  loading: boolean;
  ariaLabel: string;
  onPageChange: (page: number) => void;
};

/** Thanh phân trang chuẩn cho các bảng admin (ẩn khi chỉ có 1 trang). */
export function AdminPagination({
  page,
  totalPages,
  loading,
  ariaLabel,
  onPageChange,
}: AdminPaginationProps) {
  if (totalPages <= 1) return null;

  const visiblePages = getVisiblePages(page, totalPages);

  return (
    <nav
      aria-label={ariaLabel}
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
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft aria-hidden="true" />
        </Button>
        {visiblePages.map((pageNumber, index) => {
          const previousPage = visiblePages[index - 1];
          return (
            <span key={pageNumber} className="contents">
              {previousPage && pageNumber - previousPage > 1 ? (
                <span aria-hidden="true" className="px-1 text-muted-foreground">
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
                onClick={() => onPageChange(pageNumber)}
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
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRight aria-hidden="true" />
        </Button>
      </div>
    </nav>
  );
}
