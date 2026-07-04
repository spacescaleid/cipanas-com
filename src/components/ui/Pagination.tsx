// src/components/ui/Pagination.tsx
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  getPageNumbers,
  type PaginationMeta,
} from "@/lib/pagination";

interface Props {
  meta: PaginationMeta;
  /**
   * Base path untuk generate link, misal `/video` atau `/berita`.
   * Component akan append `?page=N` (atau merge dengan query params existing kalau ada).
   */
  basePath: string;
  /**
   * Optional: query params tambahan yang harus di-preserve saat navigasi
   * (misal filter kategori). Format: "&status=PENDING&kategori=politik"
   */
  extraQuery?: string;
  /**
   * Label untuk keterangan (default "results").
   */
  label?: string;
}

/**
 * Reusable pagination component.
 *
 * Style: `Showing 1 to 9 of 26 results  [<] [1] [2] [3] [>]`
 * Support smart truncation dengan ellipsis untuk banyak halaman.
 *
 * @example
 * <Pagination
 *   meta={{ currentPage: 1, totalPages: 3, ... }}
 *   basePath="/video"
 *   label="video"
 * />
 */
export function Pagination({
  meta,
  basePath,
  extraQuery = "",
  label = "hasil",
}: Props) {
  // Jangan render kalau cuma 1 halaman
  if (meta.totalPages <= 1) {
    return null;
  }

  const pageNumbers = getPageNumbers(meta.currentPage, meta.totalPages);

  const buildUrl = (page: number): string => {
    const params = new URLSearchParams(extraQuery.replace(/^&/, ""));
    if (page > 1) {
      params.set("page", String(page));
    }
    const query = params.toString();
    return query ? `${basePath}?${query}` : basePath;
  };

  return (
    <nav
      aria-label="Pagination"
      className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-between"
    >
      {/* Info: Showing X to Y of Z */}
      <p className="text-sm text-neutral-600 dark:text-neutral-400">
        Menampilkan{" "}
        <span className="font-semibold text-neutral-900 dark:text-white">
          {meta.startItem}
        </span>{" "}
        sampai{" "}
        <span className="font-semibold text-neutral-900 dark:text-white">
          {meta.endItem}
        </span>{" "}
        dari{" "}
        <span className="font-semibold text-neutral-900 dark:text-white">
          {meta.totalItems}
        </span>{" "}
        {label}
      </p>

      {/* Pagination buttons */}
      <div className="flex items-center gap-1">
        {/* Prev button */}
        {meta.hasPrevPage ? (
          <Link
            href={buildUrl(meta.currentPage - 1)}
            className="inline-flex h-9 items-center justify-center rounded-lg border border-neutral-300 bg-white px-2 text-sm text-neutral-700 transition hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
            aria-label="Halaman sebelumnya"
          >
            <ChevronLeft className="h-4 w-4" />
          </Link>
        ) : (
          <span className="inline-flex h-9 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50 px-2 text-sm text-neutral-400 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-600">
            <ChevronLeft className="h-4 w-4" />
          </span>
        )}

        {/* Page number buttons */}
        {pageNumbers.map((page, idx) => {
          if (page === "...") {
            return (
              <span
                key={`ellipsis-${idx}`}
                className="inline-flex h-9 w-9 items-center justify-center text-sm text-neutral-400"
              >
                ...
              </span>
            );
          }

          const isCurrent = page === meta.currentPage;

          return isCurrent ? (
            <span
              key={page}
              className="inline-flex h-9 min-w-9 items-center justify-center rounded-lg bg-brand-600 px-3 text-sm font-semibold text-white"
              aria-current="page"
            >
              {page}
            </span>
          ) : (
            <Link
              key={page}
              href={buildUrl(page)}
              className="inline-flex h-9 min-w-9 items-center justify-center rounded-lg border border-neutral-300 bg-white px-3 text-sm text-neutral-700 transition hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
              aria-label={`Halaman ${page}`}
            >
              {page}
            </Link>
          );
        })}

        {/* Next button */}
        {meta.hasNextPage ? (
          <Link
            href={buildUrl(meta.currentPage + 1)}
            className="inline-flex h-9 items-center justify-center rounded-lg border border-neutral-300 bg-white px-2 text-sm text-neutral-700 transition hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
            aria-label="Halaman berikutnya"
          >
            <ChevronRight className="h-4 w-4" />
          </Link>
        ) : (
          <span className="inline-flex h-9 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50 px-2 text-sm text-neutral-400 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-600">
            <ChevronRight className="h-4 w-4" />
          </span>
        )}
      </div>
    </nav>
  );
}