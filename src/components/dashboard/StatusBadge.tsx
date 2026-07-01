// src/components/dashboard/StatusBadge.tsx
import type { ArticleStatus } from "@prisma/client";
import { cn } from "@/lib/utils";

interface Props {
  status: ArticleStatus;
  className?: string;
}

const config: Record<
  ArticleStatus,
  { label: string; className: string }
> = {
  DRAFT: {
    label: "Draft",
    className:
      "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
  },
  PENDING: {
    label: "Menunggu Review",
    className:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  },
  REVISION: {
    label: "Perlu Revisi",
    className:
      "bg-accent-100 text-accent-700 dark:bg-accent-900/40 dark:text-accent-300",
  },
  PUBLISHED: {
    label: "Tayang",
    className:
      "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  },
  REJECTED: {
    label: "Ditolak",
    className: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  },
};

export function StatusBadge({ status, className }: Props) {
  const c = config[status];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        c.className,
        className
      )}
    >
      {c.label}
    </span>
  );
}