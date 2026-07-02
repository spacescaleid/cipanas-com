// src/components/admin/AdOrderStatusBadge.tsx
import type { AdOrderStatus } from "@prisma/client";
import { cn } from "@/lib/utils";

interface Props {
  status: AdOrderStatus;
  className?: string;
}

const config: Record<AdOrderStatus, { label: string; className: string }> = {
  PENDING_PAYMENT: {
    label: "Menunggu Bayar",
    className:
      "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
  },
  PENDING_APPROVAL: {
    label: "Menunggu Approval",
    className:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  },
  ACTIVE: {
    label: "Aktif",
    className:
      "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  },
  EXPIRED: {
    label: "Kadaluwarsa",
    className:
      "bg-neutral-200 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-400",
  },
  REJECTED: {
    label: "Ditolak",
    className: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  },
};

export function AdOrderStatusBadge({ status, className }: Props) {
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