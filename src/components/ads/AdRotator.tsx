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
 * FILOSOFI:
 * - Tinggi maksimum bener-bener di-LOCK (bukan cuma hint) supaya iklan
 *   TIDAK PERNAH melebihi tinggi yang dipatok, apapun aspect ratio gambar
 *   yang di-upload pengiklan.
 * - Batasan upload di server cuma 200×50 s/d 2000×2000 (lihat validateAdImageDimensions),
 *   jadi pengiklan bebas upload aspect ratio apa saja. Kita perlu handle
 *   itu dengan graceful — pakai `object-contain` supaya gambar tetap utuh
 *   (tidak terpotong, tidak stretch), dengan letterbox (whitespace atas/bawah)
 *   kalau aspect ratio gambar beda dari kotak iklan.
 * - Angka height di sini SENGAJA lebih longgar dari height "ideal" banner
 *   (misal HEADER ideal 90px, di sini kita kasih 160px) supaya banner
 *   normal-height tampil natural, tapi banner ekstrem tetap ke-cap.
 */
const AD_DIMENSIONS: Record<
  AdPosition,
  {
    intrinsicWidth: number;
    intrinsicHeight: number;
    /** Class untuk wrapper luar — batasi lebar */
    outerClass: string;
    /** Class untuk container image — LOCK height di sini */
    innerClass: string;
  }
> = {
  HEADER: {
    intrinsicWidth: 728,
    intrinsicHeight: 90,
    outerClass: "mx-auto w-full max-w-[728px]",
    // h-40 = 160px di semua breakpoint. Cukup buat banner 728×90 sampai
    // banner agak square. Kalau lebih tinggi lagi, di-letterbox.
    innerClass: "relative w-full h-32 sm:h-40",
  },
  FOOTER: {
    intrinsicWidth: 728,
    intrinsicHeight: 90,
    outerClass: "mx-auto w-full max-w-[728px]",
    innerClass: "relative w-full h-32 sm:h-40",
  },
  SIDEBAR: {
    intrinsicWidth: 300,
    intrinsicHeight: 250,
    outerClass: "mx-auto w-full max-w-[300px]",
    // Sidebar biasanya kotak, jadi kasih h yang mendekati square (280px)
    innerClass: "relative w-full h-[280px]",
  },
  INLINE: {
    intrinsicWidth: 600,
    intrinsicHeight: 200,
    outerClass: "mx-auto w-full max-w-[600px]",
    // Inline biasanya medium rectangle, 240px cukup
    innerClass: "relative w-full h-56 sm:h-60",
  },
};

/**
 * Rotator iklan client-side.
 * - Rotate tiap X detik (default 15 detik)
 * - Track impression lewat IntersectionObserver (cuma count kalau visible)
 * - Track impression tiap iklan cuma sekali per session
 * - Height iklan di-LOCK per posisi (tidak bisa dibocorkan gambar tinggi)
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
      { threshold: 0.5 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Track impression untuk iklan current
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

      {/*
        STRUKTUR:
        - <a>       : batasi WIDTH per posisi (max-w)
        - <div>     : LOCK HEIGHT per posisi (h fixed)
        - <Image>   : fill container, object-contain biar rasio asli terjaga
                      (bakal ada letterbox kalau rasio gambar beda dari box)
      */}
      <a
        href={`/api/ads/${currentAd.id}/click`}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className={`block overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50 transition hover:opacity-90 dark:border-neutral-800 dark:bg-neutral-900 ${dims.outerClass}`}
        aria-label={`Iklan ${currentAd.advertiserName}`}
      >
        <div className={dims.innerClass}>
          <Image
            key={currentAd.id}
            src={currentAd.mediaUrl ?? "/images/placeholder-ad.png"}
            alt={`Iklan ${currentAd.advertiserName}`}
            fill
            sizes={`(max-width: 640px) 100vw, ${dims.intrinsicWidth}px`}
            className="object-contain animate-fade-in"
            unoptimized
          />
        </div>
      </a>
    </div>
  );
}