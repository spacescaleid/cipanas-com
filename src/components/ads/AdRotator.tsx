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
 * STRATEGI 2-MODE:
 *
 * MODE "banner" (HEADER, FOOTER):
 * - Container fixed size (max-w × h).
 * - Gambar stretch fill container pakai object-cover.
 * - Rasio gambar mengikuti container, bukan gambar asli.
 * - Trade-off: gambar dengan aspek beda dari 728:160 akan ke-crop
 *   sedikit dari sisi, TAPI banner terlihat "penuh" seperti di
 *   news portal profesional (Kompas, Detik, dll).
 *
 * MODE "natural" (INLINE, SIDEBAR):
 * - Container batasi max-width saja, tinggi ikut natural gambar.
 * - Gambar tampil utuh dengan aspek asli (tidak ke-crop sama sekali).
 * - Trade-off: tinggi container bervariasi tergantung gambar upload,
 *   tapi respectful ke pengiklan (gambar tampil apa adanya).
 */
type AdMode = "banner" | "natural";

interface AdDimension {
  mode: AdMode;
  intrinsicWidth: number;
  intrinsicHeight: number;
  /** Class untuk wrapper luar */
  outerClass: string;
  /** Class untuk container image (khusus mode banner) */
  innerClass?: string;
  /** Class untuk image (khusus mode natural) */
  imageClass?: string;
}

const AD_DIMENSIONS: Record<AdPosition, AdDimension> = {
  HEADER: {
    mode: "banner",
    intrinsicWidth: 728,
    intrinsicHeight: 160,
    outerClass: "mx-auto w-full max-w-[728px]",
    // Container fixed 160px height, image stretch fill (object-cover)
    innerClass: "relative w-full h-32 sm:h-40",
  },
  FOOTER: {
    mode: "banner",
    intrinsicWidth: 728,
    intrinsicHeight: 160,
    outerClass: "mx-auto w-full max-w-[728px]",
    innerClass: "relative w-full h-32 sm:h-40",
  },
  SIDEBAR: {
    mode: "natural",
    intrinsicWidth: 300,
    intrinsicHeight: 250,
    outerClass: "mx-auto w-full max-w-[300px]",
    // Image natural aspect, batasi max-height biar tidak terlalu tinggi
    imageClass: "h-auto w-full max-h-[400px] object-cover",
  },
  INLINE: {
    mode: "natural",
    intrinsicWidth: 600,
    intrinsicHeight: 200,
    outerClass: "mx-auto w-full max-w-[600px]",
    // Gambar tampil natural, batasi max-height ke 500px sebagai safety
    imageClass: "h-auto w-full max-h-[500px] object-cover",
  },
};

/**
 * Rotator iklan client-side.
 * - Rotate tiap X detik (default 15 detik)
 * - Track impression via IntersectionObserver
 * - Support 2 mode: banner (fill container) & natural (fit gambar)
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
        className={`block overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100 transition hover:opacity-90 dark:border-neutral-800 dark:bg-neutral-900 ${dims.outerClass}`}
        aria-label={`Iklan ${currentAd.advertiserName}`}
      >
        {dims.mode === "banner" ? (
          // ═══════════════════════════════════════════════════════════
          // MODE BANNER (HEADER, FOOTER)
          // Container fixed, image stretch fill dengan object-cover.
          // Cocok untuk banner ala news portal.
          // ═══════════════════════════════════════════════════════════
          <div className={dims.innerClass}>
            <Image
              key={currentAd.id}
              src={currentAd.mediaUrl ?? "/images/placeholder-ad.png"}
              alt={`Iklan ${currentAd.advertiserName}`}
              fill
              sizes={`(max-width: 640px) 100vw, ${dims.intrinsicWidth}px`}
              className="object-cover animate-fade-in"
              unoptimized
              priority={position === "HEADER"}
            />
          </div>
        ) : (
          // ═══════════════════════════════════════════════════════════
          // MODE NATURAL (INLINE, SIDEBAR)
          // Container fit ke gambar, image tampil dengan aspek asli.
          // Cocok untuk medium rectangle / creative ads.
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