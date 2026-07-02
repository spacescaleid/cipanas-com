// src/components/ads/AdSlotDisplay.tsx
import type { AdPosition } from "@prisma/client";

import { getActiveAdsForPosition } from "@/lib/ad-queries";
import { AdSlotPlaceholder } from "./AdSlotPlaceholder";
import { AdRotator } from "./AdRotator";

interface Props {
  position: AdPosition;
  className?: string;
}

/**
 * Server component yang fetch iklan aktif untuk posisi ini,
 * lalu delegasikan render + rotasi ke client component AdRotator.
 */
export async function AdSlotDisplay({ position, className }: Props) {
  const ads = await getActiveAdsForPosition(position, 5);

  if (ads.length === 0) {
    return <AdSlotPlaceholder position={position} className={className} />;
  }

  const serialized = ads.map((a) => ({
    id: a.id,
    advertiserName: a.advertiserName ?? "",
    mediaUrl: a.imageUrl ?? a.mediaUrl,
  }));

  return (
    <div className={className}>
      <AdRotator ads={serialized} rotateIntervalMs={15000} />
    </div>
  );
}