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
 * HEADER: Hero banner style — full width viewport, tinggi generous.
 *         Gambar object-cover fill container (bikin hero yang solid).
 * FOOTER: Sama seperti HEADER (hero style).
 * SIDEBAR: Natural, kotak ~300px.
 * INLINE: Natural, medium rectangle ~600px.
 */
type AdMode = "hero" | "natural";

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
    mode: "hero",
    intrinsicWidth: 1920,
    intrinsicHeight: 500,
    // Full width viewport
    outerClass: "w-full",
    // Height responsive: mobile lebih kecil, desktop hero-size
    innerClass: "relative w-full h-56 sm:h-72 md:h-96 lg:h-[500px]",
  },
  FOOTER: {
    mode: "hero",
    intrinsicWidth: 1920,
    intrinsicHeight: 400,
    outerClass: "w-full",
    innerClass: "relative w-full h-48 sm:h-64 md:h-80 lg:h-96",
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
  const isHero = dims.mode === "hero";

  return (
    <div ref={containerRef} className={isHero ? "w-full" : undefined}>
      {/* Label + indicator: cuma tampil untuk mode natural (bukan hero) */}
      {!isHero && (
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
      )}

      <a
        href={`/api/ads/${currentAd.id}/click`}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className={`block overflow-hidden bg-neutral-100 transition hover:opacity-90 dark:bg-neutral-900 ${
          isHero ? "" : "rounded-xl border border-neutral-200 dark:border-neutral-800"
        } ${dims.outerClass}`}
        aria-label={`Iklan ${currentAd.advertiserName}`}
      >
        {isHero ? (
          // ═══════════════════════════════════════════════════════════
          // MODE HERO (HEADER, FOOTER)
          // Full width, tinggi generous, object-cover fill container.
          // Cocok untuk hero banner ala coredigital.net.id.
          // ═══════════════════════════════════════════════════════════
          <div className={`relative ${dims.innerClass}`}>
            <Image
              key={currentAd.id}
              src={currentAd.mediaUrl ?? "/images/placeholder-ad.png"}
              alt={`Iklan ${currentAd.advertiserName}`}
              fill
              sizes="100vw"
              className="object-cover animate-fade-in"
              unoptimized
              priority={position === "HEADER"}
            />
            {/* Overlay label "Iklan" di pojok — subtle biar tetap tahu ini ads */}
            <div className="absolute top-3 left-3 rounded bg-black/50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-white backdrop-blur-sm">
              Iklan
            </div>
            {/* Indicator dots di bawah kalau ada multiple ads */}
            {ads.length > 1 && (
              <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
                {ads.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentIndex(i);
                    }}
                    className={`h-2 w-2 rounded-full transition ${
                      i === currentIndex
                        ? "bg-white scale-125"
                        : "bg-white/50 hover:bg-white/75"
                    }`}
                    aria-label={`Iklan ${i + 1} dari ${ads.length}`}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          // ═══════════════════════════════════════════════════════════
          // MODE NATURAL (INLINE, SIDEBAR)
          // Gambar tampil dengan aspek asli, tinggi ikut gambar.
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