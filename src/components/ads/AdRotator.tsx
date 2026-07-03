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
 * FILOSOFI (revisi): pakai kotak dengan ASPECT RATIO TETAP sesuai ukuran
 * resmi slot (728:90, 300:250, 600:200), bukan "max-height safety net"
 * yang gampang dilonggarin lagi dan gampang bocor di CSS.
 *
 * Dengan aspect-ratio tetap + `fill` + `object-contain`:
 * - Tinggi kotak SELALU mengikuti rumus (lebar kotak ÷ rasio) — tidak
 *   pernah bisa membengkak lebih dari itu, apa pun ukuran file gambar
 *   yang diupload pengiklan (beda dengan pendekatan `h-auto` sebelumnya
 *   yang tingginya ikut aspect ratio FILE ASLI, bukan aspect ratio SLOT).
 * - Kalau gambar pengiklan rasionya beda dari slot, `object-contain`
 *   bikin gambar di-scale utuh (tidak terpotong) dan center di kotak —
 *   ada sedikit ruang kosong di kiri-kanan/atas-bawah (letterbox),
 *   bukan gambar jadi gepeng ATAU kotak jadi membengkak.
 * - Ruang letterbox dikasih background halus (`bg-neutral-50`) supaya
 *   tetap enak dilihat, tidak terasa seperti bug.
 */
const AD_DIMENSIONS: Record<
  AdPosition,
  {
    /** Rasio lebar:tinggi resmi slot ini, dipakai sebagai CSS aspect-ratio */
    aspectRatio: string;
    /** Class pembatas lebar maksimum kotak iklan */
    maxWidthClass: string;
    /** Ukuran untuk atribut `sizes` next/image (optimasi + hindari CLS) */
    sizes: string;
  }
> = {
  HEADER: {
    aspectRatio: "728 / 90",
    maxWidthClass: "max-w-[728px]",
    sizes: "(max-width: 768px) 100vw, 728px",
  },
  FOOTER: {
    aspectRatio: "728 / 90",
    maxWidthClass: "max-w-[728px]",
    sizes: "(max-width: 768px) 100vw, 728px",
  },
  SIDEBAR: {
    aspectRatio: "300 / 250",
    maxWidthClass: "max-w-[300px]",
    sizes: "300px",
  },
  INLINE: {
    aspectRatio: "600 / 200",
    maxWidthClass: "max-w-[600px]",
    sizes: "(max-width: 640px) 100vw, 600px",
  },
};

/**
 * Rotator iklan client-side.
 * - Rotate tiap X detik (default 15 detik)
 * - Track impression lewat IntersectionObserver (cuma count kalau visible)
 * - Track impression tiap iklan cuma sekali per session
 * - Ukuran dikunci pakai kotak aspect-ratio tetap per posisi (lihat AD_DIMENSIONS)
 *   — gambar apa pun rasionya tidak akan pernah membuat kotak membengkak.
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
        Struktur wrapper (revisi):
        - <a>   = link click + batas lebar maksimum (max-w) + overflow-hidden
        - <div> = KOTAK dengan aspect-ratio TETAP sesuai ukuran resmi slot —
                  ini yang mengunci tinggi, bukan mengikuti tinggi file gambar
        - <Image fill> = mengisi kotak, object-contain (tidak dipotong,
                  tidak bikin kotak membengkak, cukup letterbox kalau rasio beda)
      */}
      <a
        href={`/api/ads/${currentAd.id}/click`}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className={`mx-auto block w-full overflow-hidden rounded-xl border border-neutral-200 bg-white transition hover:opacity-90 dark:border-neutral-800 dark:bg-neutral-900 ${dims.maxWidthClass}`}
        aria-label={`Iklan ${currentAd.advertiserName}`}
      >
        <div
          className="relative w-full bg-neutral-50 dark:bg-neutral-800/40"
          style={{ aspectRatio: dims.aspectRatio }}
        >
          <Image
            key={currentAd.id}
            src={currentAd.mediaUrl ?? "/images/placeholder-ad.png"}
            alt={`Iklan ${currentAd.advertiserName}`}
            fill
            sizes={dims.sizes}
            className="object-contain animate-fade-in"
            unoptimized
          />
        </div>
      </a>
    </div>
  );
}