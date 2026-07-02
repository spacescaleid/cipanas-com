// src/components/ads/AdStatusBadge.tsx

import type { AdOrderStatus } from "@/types/ad-order";
import { AD_STATUS_LABELS, AD_STATUS_COLORS } from "@/types/ad-order";

interface AdStatusBadgeProps {
  status: AdOrderStatus;
  size?: "sm" | "md";
}

export function AdStatusBadge({ status, size = "md" }: AdStatusBadgeProps) {
  const colors = AD_STATUS_COLORS[status];
  const label = AD_STATUS_LABELS[status];

  const sizeClasses = size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-3 py-1";

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 rounded-full font-medium border
        ${colors.bg} ${colors.text} ${colors.border} ${sizeClasses}
      `}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          status === "ACTIVE"
            ? "bg-green-500 animate-pulse"
            : status === "PENDING_PAYMENT"
            ? "bg-yellow-500"
            : status === "AWAITING_CREATIVE"
            ? "bg-blue-500"
            : status === "PENDING_REVIEW"
            ? "bg-purple-500"
            : "bg-gray-400"
        }`}
      />
      {label}
    </span>
  );
}