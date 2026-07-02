// src/components/admin/AdOrderFilterBar.tsx
import Link from "next/link";
import { cn } from "@/lib/utils";

type FilterKey =
  | "ALL"
  | "PENDING_PAYMENT"
  | "AWAITING_CREATIVE"
  | "PENDING_REVIEW"
  | "ACTIVE"
  | "EXPIRED"
  | "REJECTED";

interface Props {
  current: FilterKey;
  counts: Record<string, number>;
}

const filters: {
  key: FilterKey;
  label: string;
  priority?: boolean;
}[] = [
  { key: "AWAITING_CREATIVE", label: "Menunggu Upload", priority: true },
  { key: "ACTIVE", label: "Aktif" },
  { key: "PENDING_PAYMENT", label: "Belum Bayar" },
  { key: "EXPIRED", label: "Kadaluwarsa" },
  { key: "REJECTED", label: "Ditolak" },
  { key: "ALL", label: "Semua" },
];

export function AdOrderFilterBar({ current, counts }: Props) {
  return (
    <div className="flex flex-wrap gap-2 border-b border-neutral-200 pb-4 dark:border-neutral-800">
      {filters.map((f) => {
        const active = current === f.key;
        const count = counts[f.key] ?? 0;
        const href =
          f.key === "ALL"
            ? "/admin/iklan"
            : `/admin/iklan?status=${f.key}`;
        return (
          <Link
            key={f.key}
            href={href}
            className={cn(
              "flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-medium transition",
              active
                ? "bg-brand-600 text-white"
                : f.priority && count > 0
                ? "border border-amber-400 bg-amber-50 text-amber-800 hover:bg-amber-100 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                : "border border-neutral-200 bg-white text-neutral-700 hover:border-brand-500 hover:text-brand-700 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300"
            )}
          >
            {f.label}
            <span
              className={cn(
                "rounded-full px-1.5 text-[10px] font-bold",
                active
                  ? "bg-white/20 text-white"
                  : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
              )}
            >
              {count}
            </span>
          </Link>
        );
      })}
    </div>
  );
}