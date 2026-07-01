// src/lib/format.ts
import { formatDistanceToNow, format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

/** Format tanggal jadi "3 hari yang lalu" */
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return formatDistanceToNow(d, { addSuffix: true, locale: idLocale });
}

/** Format tanggal jadi "15 Januari 2024" */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "d MMMM yyyy", { locale: idLocale });
}

/** Format tanggal jadi "15 Jan 2024, 14:30" */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "d MMM yyyy, HH:mm", { locale: idLocale });
}

/**
 * Estimasi waktu baca berdasarkan word count.
 * Asumsi kecepatan baca 200 kata/menit.
 */
export function estimateReadingTime(htmlContent: string): number {
  const text = htmlContent.replace(/<[^>]*>/g, ""); // strip HTML tags
  const words = text.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / 200);
  return Math.max(1, minutes);
}

/** Format angka jadi "1.2K", "5.3K", dll. */
export function formatCompactNumber(num: number): string {
  if (num < 1000) return num.toString();
  if (num < 1_000_000) return `${(num / 1000).toFixed(1).replace(/\.0$/, "")}K`;
  return `${(num / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
}

/** Format rupiah */
export function formatRupiah(amount: number | string): string {
  const n = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(n);
}