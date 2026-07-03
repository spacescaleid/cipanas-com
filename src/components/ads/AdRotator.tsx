// src/components/ads/AdRotator.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { AdPosition } from "@prisma/client";

interface AdItem {
  id: string;
  advertiserName: string;
  mediaUrl: string | null;
}

interface Props {
  ads: AdItem[];
  position: AdPosition;
  rotateIntervalMs?: number;
}

/**
 * Konfigurasi dimensi & pembatas ukuran per posisi iklan.
 *
 * `intrinsic`: ukuran asli banner (untuk width/height prop di next/image,
 *              biar Next tahu aspect ratio & bisa optimize download).
 * `wrapperClass`: pembatas max-w/max-h pada wrapper — mencegah iklan
 *                 melebar/meninggi tak terkontrol di layar besar.
 * `imgClass`: cara gambar mengisi wrapper — pakai object-contain supaya
 *             tidak gepeng kalau pengiklan upload dengan rasio agak beda.
 * `mobileHeightClass`: fallback tinggi di mobile (biar konsisten dengan placeholder).
 */
const AD_DIMENSIONS: Record<
  AdPosition,
  {
    intrinsicWidth: number;
    intrinsicHeight: number;
    wrapperClass: string;
  }
> = {
  HEADER: {
    intrinsicWidth: 728,
    intrinsicHeight: 90,
    wrapperClass: "mx-auto w-full max-w-[728px] max-h-[120px]",
  },
  FOOTER: {
    intrinsicWidth: 728,
    intrinsicHeight: 90,
    wrapperClass: "mx-auto w-full max-w-[728px] max-h-[120px]",
  },
  SIDEBAR: {
    intrinsicWidth: 300,
    intrinsicHeight: 250,
    wrapperClass: "mx-auto w-full max-w-[300px] max-h-[280px]",
  },
  INLINE: {
    intrinsicWidth: 600,
    intrinsicHeight: 200,
    wrapperClass: "mx-auto w-full max-w-[600px] max-h-[220px]",
  },
};

/**
 * Rotator iklan client-side.
 * - Rotate tiap X detik (default 15 detik)
 * - Track impression lewat IntersectionObserver (cuma count kalau visible)
 * - Track impression tiap iklan cuma sekali per session
 * - Ukuran gambar dibatasi per posisi via AD_DIMENSIONS
 */
export function AdRotator({ ads, position, rotateIntervalMs = 15000 }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const impressedIdsRef = useRef<Set<string>>(new Set());
  const [isVisible, setIsVisible] = useState(false);

  const dims = AD_DIMENSIONS[position];

  // IntersectionObserver: cek apakah iklan visible di viewport
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.5 } // minimal 50% visible baru dianggap "seen"
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Track impression untuk iklan current
  useEffect(() => {
    if (!isVisible || ads.length === 0) return;
    const currentAd = ads[currentIndex];
    if (!currentAd) return;

    // Cuma track sekali per session per iklan
    if (impressedIdsRef.current.has(currentAd.id)) return;
    impressedIdsRef.current.add(currentAd.id);

    // Fire-and-forget POST
    fetch(`/api/ads/${currentAd.id}/impression`, {
      method: "POST",
      keepalive: true,
    }).catch(() => {
      // Silent fail
    });
  }, [currentIndex, isVisible, ads]);

  // Auto-rotate
  useEffect(() => {
    if (ads.length <= 1) return; // no rotation if only 1 ad

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ads.length);
    }, rotateIntervalMs);

    return () => clearInterval(interval);
  }, [ads.length, rotateIntervalMs]);

  if (ads.length === 0) return null;

  const currentAd = ads[currentIndex];

  return (
    <div ref={containerRef}>
      <div className="mb-1 flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-wider text-neutral-400">
          Iklan
        </span>
        {ads.length > 1 && (
          <div className="flex gap-1">
            {ads.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCurrentIndex(i)}
                className={`h-1.5 w-1.5 rounded-full transition ${
                  i === currentIndex
                    ? "bg-brand-600"
                    : "bg-neutral-300 dark:bg-neutral-700"
                }`}
                aria-label={`Iklan ${i + 1} dari ${ads.length}`}
              />
            ))}
          </div>
        )}
      </div>

      <a
        href={`/api/ads/${currentAd.id}/click`}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className={`block overflow-hidden rounded-xl border border-neutral-200 bg-white transition hover:opacity-90 dark:border-neutral-800 dark:bg-neutral-900 ${dims.wrapperClass}`}
        aria-label={`Iklan ${currentAd.advertiserName}`}
      >
        <Image
          key={currentAd.id}
          src={currentAd.mediaUrl ?? "/images/placeholder-ad.png"}
          alt={`Iklan ${currentAd.advertiserName}`}
          width={dims.intrinsicWidth}
          height={dims.intrinsicHeight}
          className="h-auto w-full object-contain animate-fade-in"
          unoptimized
        />
      </a>
    </div>
  );
}