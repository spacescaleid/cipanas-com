// src/components/dashboard/ArticleStatusFilter.tsx
import Link from "next/link";
import { cn } from "@/lib/utils";

type FilterKey = "ALL" | "DRAFT" | "PENDING" | "REVISION" | "PUBLISHED" | "REJECTED";

interface Props {
  current: FilterKey;
  counts: Record<string, number>;
}

const filters: { key: FilterKey; label: string }[] = [
  { key: "ALL", label: "Semua" },
  { key: "DRAFT", label: "Draft" },
  { key: "PENDING", label: "Menunggu Review" },
  { key: "REVISION", label: "Perlu Revisi" },
  { key: "PUBLISHED", label: "Tayang" },
  { key: "REJECTED", label: "Ditolak" },
];

export function ArticleStatusFilter({ current, counts }: Props) {
  return (
    <div className="flex flex-wrap gap-2 border-b border-neutral-200 pb-4 dark:border-neutral-800">
      {filters.map((f) => {
        const active = current === f.key;
        const count = counts[f.key] ?? 0;
        const href = f.key === "ALL" ? "/dashboard/tulisan" : `/dashboard/tulisan?status=${f.key}`;
        return (
          <Link
            key={f.key}
            href={href}
            className={cn(
              "flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-medium transition",
              active
                ? "bg-brand-600 text-white"
                : "border border-neutral-200 bg-white text-neutral-700 hover:border-brand-500 hover:text-brand-700 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:text-brand-400"
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