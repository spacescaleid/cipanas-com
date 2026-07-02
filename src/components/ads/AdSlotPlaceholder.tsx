// src/components/ads/AdSlotPlaceholder.tsx

import Link from "next/link";
import type { AdPosition } from "@prisma/client";

interface AdSlotPlaceholderProps {
  position: AdPosition | string;
  className?: string;
}

const POSITION_LABELS: Record<string, { label: string; size: string; height: string }> = {
  HEADER: { label: "Ruang Iklan Header", size: "728×90 / 970×250", height: "h-24 lg:h-32" },
  SIDEBAR: { label: "Ruang Iklan Sidebar", size: "300×250 / 300×600", height: "h-64" },
  INLINE: { label: "Ruang Iklan Inline", size: "300×250 / 336×280", height: "h-32" },
  FOOTER: { label: "Ruang Iklan Footer", size: "728×90 / 970×90", height: "h-24" },
};

export function AdSlotPlaceholder({ position, className = "" }: AdSlotPlaceholderProps) {
  const config = POSITION_LABELS[position] ?? {
    label: "Ruang Iklan",
    size: "—",
    height: "h-24",
  };

  return (
    <div
      className={`flex items-center justify-center rounded-lg border border-dashed border-neutral-300 bg-neutral-50 ${config.height} ${className} dark:border-neutral-700 dark:bg-neutral-800/50`}
    >
      <div className="text-center">
        <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
          {config.label}
        </p>
        <p className="mt-0.5 text-[10px] text-neutral-400">{config.size}</p>
        <Link
          href="/pasang-iklan"
          className="mt-2 inline-block text-[10px] font-semibold text-blue-600 hover:underline dark:text-blue-400"
        >
          Pasang iklan di sini →
        </Link>
      </div>
    </div>
  );
}