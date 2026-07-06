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
 * Pendekatan: max-w + max-h pada elemen yang SAMA dengan overflow-hidden.
 * Image pakai h-auto w-full object-contain supaya gambar iklan tampil utuh
 * (tidak dipotong), dan dibatasi oleh max-h di parent yang sama.
 *
 * PENTING: max-w dan max-h WAJIB ada di elemen yang sama — kalau dipisah
 * ke parent-child yang berbeda, max-h tidak ter-enforce dengan benar.
 */
const AD_DIMENSIONS: Record<
  AdPosition,
  {
    maxWidthClass: string;
    maxHeightClass: string;
    sizes: string;
  }
> = {
  HEADER: {
    maxWidthClass: "max-w-[728px]",
    maxHeightClass: "max-h-[220px]",
    sizes: "(max-width: 768px) 100vw, 728px",
  },
  FOOTER: {
    maxWidthClass: "max-w-[728px]",
    maxHeightClass: "max-h-[220px]",
    sizes: "(max-width: 768px) 100vw, 728px",
  },
  SIDEBAR: {
    maxWidthClass: "max-w-[300px]",
    maxHeightClass: "max-h-[320px]",
    sizes: "300px",
  },
  INLINE: {
    maxWidthClass: "max-w-[600px]",
    maxHeightClass: "max-h-[260px]",
    sizes: "(max-width: 640px) 100vw, 600px",
  },
};

/**
 * Rotator iklan client-side.
 * Logika rotasi, impression tracking, dan click tracking tidak berubah
 * dari versi sebelumnya — hanya styling ukuran tampilan yang diperbaiki.
 */
export function AdRotator({ ads, position, rotateIntervalMs = 15000 }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const impressedIdsRef = useRef<Set<string>>(new Set());
  const [isVisible, setIsVisible] = useState(false);

  const dim = AD_DIMENSIONS[position];

  // IntersectionObserver — tidak berubah
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

  // Track impression — tidak berubah
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
      // Silent fail — impression tidak boleh crash UI
    });
  }, [currentIndex, isVisible, ads]);

  // Auto-rotate — tidak berubah
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
    <div ref={containerRef} className="w-full">
      {/* Label + dots indicator */}
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

      {/*
       * KUNCI PERBAIKAN:
       * max-w, max-h, dan overflow-hidden ada di elemen yang SAMA (<a>).
       * Image pakai object-contain + h-auto + w-full supaya gambar tampil
       * utuh tanpa dipotong, dibatasi oleh max-h di parent ini.
       * mx-auto supaya iklan tetap center kalau container lebih lebar.
       */}
      <a
        href={`/api/ads/${currentAd.id}/click`}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className={`mx-auto block overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100 transition hover:opacity-90 dark:border-neutral-800 dark:bg-neutral-900 ${dim.maxWidthClass} ${dim.maxHeightClass}`}
        aria-label={`Iklan ${currentAd.advertiserName}`}
      >
        <Image
          key={currentAd.id}
          src={currentAd.mediaUrl ?? "/images/placeholder-ad.png"}
          alt={`Iklan ${currentAd.advertiserName}`}
          width={1200}
          height={400}
          sizes={dim.sizes}
          className="h-auto w-full object-contain animate-fade-in"
          unoptimized
          priority={position === "HEADER"}
        />
      </a>
    </div>
  );
}