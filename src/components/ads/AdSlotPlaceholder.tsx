// src/components/ads/AdSlotPlaceholder.tsx
import Link from "next/link";
import type { AdPosition } from "@prisma/client";
import { Megaphone } from "lucide-react";

import { cn } from "@/lib/utils";

interface Props {
  position: AdPosition;
  className?: string;
}

const heightMap: Record<AdPosition, string> = {
  HEADER: "h-24",
  SIDEBAR: "h-64",
  INLINE: "h-32",
  FOOTER: "h-20",
};

/**
 * Placeholder yang tampil kalau tidak ada iklan aktif di posisi tersebut.
 * Menampilkan CTA "Pasang Iklan di Sini".
 */
export function AdSlotPlaceholder({ position, className }: Props) {
  return (
    <div className={className}>
      <div className="mb-1 text-[10px] uppercase tracking-wider text-neutral-400">
        Iklan
      </div>
      <Link
        href="/pasang-iklan"
        className={cn(
          "flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-50 text-center text-neutral-500 transition hover:border-brand-500 hover:bg-brand-50 hover:text-brand-600 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:border-brand-500",
          heightMap[position]
        )}
      >
        <Megaphone className="h-6 w-6" />
        <div>
          <div className="text-xs font-semibold">Pasang Iklan di Sini</div>
          <div className="text-[10px] opacity-70">Posisi {position}</div>
        </div>
      </Link>
    </div>
  );
}