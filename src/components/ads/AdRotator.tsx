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
 * Konfigurasi ukuran iklan per posisi.
 *
 * HEADER/FOOTER: Container lebar (970px), gambar tampil UTUH pakai
 *                object-contain (tidak ke-crop). Kalau aspek gambar
 *                beda dari container, akan ada whitespace di sisi
 *                — tapi gambar utuh, respect ke pengiklan.
 *
 * SIDEBAR/INLINE: Mode natural, gambar tampil dengan aspek asli.
 */
type AdMode = "banner" | "natural";

interface AdDimension {
  mode: AdMode;
  intrinsicWidth: number;
  intrinsicHeight: number;
  outerClass: string;
  innerClass?: string;
  imageClass?: string;
}

const AD_DIMENSIONS: Record<AdPosition, AdDimension> = {
  HEADER: {
    mode: "banner",
    intrinsicWidth: 970,
    intrinsicHeight: 250,
    // Container lebih lebar (970px) — support format banner besar
    outerClass: "mx-auto w-full max-w-[970px]",
    // Height fixed, gambar object-contain (utuh, tidak crop)
    innerClass: "relative w-full h-40 sm:h-52 lg:h-60",
  },
  FOOTER: {
    mode: "banner",
    intrinsicWidth: 970,
    intrinsicHeight: 250,
    outerClass: "mx-auto w-full max-w-[970px]",
    innerClass: "relative w-full h-40 sm:h-52 lg:h-60",
  },
  SIDEBAR: {
    mode: "natural",
    intrinsicWidth: 300,
    intrinsicHeight: 250,
    outerClass: "mx-auto w-full max-w-[300px]",
    imageClass: "h-auto w-full max-h-[400px] object-cover",
  },
  INLINE: {
    mode: "natural",
    intrinsicWidth: 600,
    intrinsicHeight: 200,
    outerClass: "mx-auto w-full max-w-[600px]",
    imageClass: "h-auto w-full max-h-[500px] object-cover",
  },
};

/**
 * Rotator iklan client-side.
 */
export function AdRotator({ ads, position, rotateIntervalMs = 15000 }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const impressedIdsRef = useRef<Set<string>>(new Set());
  const [isVisible, setIsVisible] = useState(false);

  const dims = AD_DIMENSIONS[position];

  // IntersectionObserver
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.5 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Track impression
  useEffect(() => {
    if (!isVisible || ads.length === 0) return;
    const currentAd = ads[currentIndex];
    if (!currentAd) return;

    if (impressedIdsRef.current.has(currentAd.id)) return;
    impressedIdsRef.current.add(currentAd.id);

    fetch(`/api/ads/${currentAd.id}/impression`, {
      method: "POST",
      keepalive: true,
    }).catch(() => {
      // Silent fail
    });
  }, [currentIndex, isVisible, ads]);

  // Auto-rotate
  useEffect(() => {
    if (ads.length <= 1) return;

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
        className={`block overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50 transition hover:opacity-90 dark:border-neutral-800 dark:bg-neutral-900 ${dims.outerClass}`}
        aria-label={`Iklan ${currentAd.advertiserName}`}
      >
        {dims.mode === "banner" ? (
          // ═══════════════════════════════════════════════════════════
          // MODE BANNER (HEADER, FOOTER)
          // Container fixed height, image object-contain (utuh, tidak crop)
          // ═══════════════════════════════════════════════════════════
          <div className={dims.innerClass}>
            <Image
              key={currentAd.id}
              src={currentAd.mediaUrl ?? "/images/placeholder-ad.png"}
              alt={`Iklan ${currentAd.advertiserName}`}
              fill
              sizes={`(max-width: 640px) 100vw, ${dims.intrinsicWidth}px`}
              className="object-contain animate-fade-in"
              unoptimized
              priority={position === "HEADER"}
            />
          </div>
        ) : (
          // ═══════════════════════════════════════════════════════════
          // MODE NATURAL (INLINE, SIDEBAR)
          // Gambar tampil dengan aspek asli, container fit ke gambar
          // ═══════════════════════════════════════════════════════════
          <Image
            key={currentAd.id}
            src={currentAd.mediaUrl ?? "/images/placeholder-ad.png"}
            alt={`Iklan ${currentAd.advertiserName}`}
            width={dims.intrinsicWidth}
            height={dims.intrinsicHeight}
            sizes={`(max-width: 640px) 100vw, ${dims.intrinsicWidth}px`}
            className={`${dims.imageClass ?? ""} animate-fade-in`}
            unoptimized
          />
        )}
      </a>
    </div>
  );
}