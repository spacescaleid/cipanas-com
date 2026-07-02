// src/components/ads/AdSlotDisplay.tsx
import Image from "next/image";
import type { AdPosition } from "@prisma/client";

import { getActiveAdForPosition } from "@/lib/ad-queries";
import { AdSlotPlaceholder } from "./AdSlotPlaceholder";

interface Props {
  position: AdPosition;
  className?: string;
}

/**
 * Server component yang render iklan aktif untuk posisi tertentu.
 * Fallback ke placeholder kalau tidak ada iklan yang aktif.
 */
export async function AdSlotDisplay({ position, className }: Props) {
  const ad = await getActiveAdForPosition(position);

  if (!ad) {
    return <AdSlotPlaceholder position={position} className={className} />;
  }

  return (
    <div className={className}>
      <div className="mb-1 text-[10px] uppercase tracking-wider text-neutral-400">
        Iklan
      </div>
      <a
        href={ad.targetUrl}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="block overflow-hidden rounded-xl border border-neutral-200 bg-white transition hover:opacity-90 dark:border-neutral-800 dark:bg-neutral-900"
        aria-label={`Iklan ${ad.advertiserName}`}
      >
        <Image
          src={ad.mediaUrl}
          alt={`Iklan ${ad.advertiserName}`}
          width={800}
          height={200}
          className="mx-auto h-auto w-full object-contain"
          unoptimized
        />
      </a>
    </div>
  );
}