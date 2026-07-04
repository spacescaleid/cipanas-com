// src/lib/pagination.ts

/**
 * Konfigurasi pagination.
 */
export interface PaginationConfig {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
}

/**
 * Meta pagination yang dipakai UI.
 */
export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  startItem: number; // Index item pertama di halaman ini (1-based)
  endItem: number; // Index item terakhir di halaman ini (1-based)
  offset: number; // SQL OFFSET untuk query DB
}

/**
 * Default: 9 item per halaman (grid 3x3).
 * Bisa di-override per pemakaian.
 */
export const DEFAULT_ITEMS_PER_PAGE = 9;

/**
 * Calculate pagination meta dari config.
 *
 * @example
 * const meta = getPaginationMeta({
 *   currentPage: 2,
 *   totalItems: 26,
 *   itemsPerPage: 9
 * });
 * // { currentPage: 2, totalPages: 3, offset: 9, ... }
 */
export function getPaginationMeta(config: PaginationConfig): PaginationMeta {
  const { currentPage, totalItems, itemsPerPage } = config;

  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);
  const offset = (safePage - 1) * itemsPerPage;

  const startItem = totalItems === 0 ? 0 : offset + 1;
  const endItem = Math.min(offset + itemsPerPage, totalItems);

  return {
    currentPage: safePage,
    totalPages,
    totalItems,
    itemsPerPage,
    hasNextPage: safePage < totalPages,
    hasPrevPage: safePage > 1,
    startItem,
    endItem,
    offset,
  };
}

/**
 * Parse `page` query param dari searchParams jadi angka.
 * Fallback ke 1 kalau invalid.
 */
export function parsePageParam(page: string | string[] | undefined): number {
  if (!page || Array.isArray(page)) return 1;
  const parsed = parseInt(page, 10);
  if (isNaN(parsed) || parsed < 1) return 1;
  return parsed;
}

/**
 * Generate array angka halaman untuk render tombol pagination.
 * Menampilkan max 5 tombol dengan smart truncation:
 * - Kalau <= 5 halaman: tampil semua
 * - Kalau > 5 halaman: tampil dengan ellipsis
 *
 * Return format: array of number | "..." (ellipsis)
 *
 * @example
 * getPageNumbers(1, 3)  → [1, 2, 3]
 * getPageNumbers(1, 10) → [1, 2, 3, "...", 10]
 * getPageNumbers(5, 10) → [1, "...", 4, 5, 6, "...", 10]
 * getPageNumbers(10, 10) → [1, "...", 8, 9, 10]
 */
export function getPageNumbers(
  currentPage: number,
  totalPages: number
): Array<number | "..."> {
  if (totalPages <= 7) {
    // Show all pages
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: Array<number | "..."> = [];

  // Selalu tampil halaman 1
  pages.push(1);

  if (currentPage <= 3) {
    // Kalau di awal: [1, 2, 3, 4, ..., last]
    pages.push(2, 3, 4, "...", totalPages);
  } else if (currentPage >= totalPages - 2) {
    // Kalau di akhir: [1, ..., last-3, last-2, last-1, last]
    pages.push(
      "...",
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages
    );
  } else {
    // Di tengah: [1, ..., current-1, current, current+1, ..., last]
    pages.push(
      "...",
      currentPage - 1,
      currentPage,
      currentPage + 1,
      "...",
      totalPages
    );
  }

  return pages;
}