// src/components/ads/AdRotator.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

interface AdItem {
  id: string;
  advertiserName: string;
  mediaUrl: string | null;
}

interface Props {
  ads: AdItem[];
  rotateIntervalMs?: number;
}

/**
 * Rotator iklan client-side.
 * - Rotate tiap X detik (default 15 detik)
 * - Track impression lewat IntersectionObserver (cuma count kalau visible)
 * - Track impression tiap iklan cuma sekali per session
 */
export function AdRotator({ ads, rotateIntervalMs = 15000 }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const impressedIdsRef = useRef<Set<string>>(new Set());
  const [isVisible, setIsVisible] = useState(false);

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
        className="block overflow-hidden rounded-xl border border-neutral-200 bg-white transition hover:opacity-90 dark:border-neutral-800 dark:bg-neutral-900"
        aria-label={`Iklan ${currentAd.advertiserName}`}
      >
        <div className="relative">
          <Image
            key={currentAd.id}
            src={currentAd.mediaUrl ?? "/images/placeholder-ad.png"}
            alt={`Iklan ${currentAd.advertiserName}`}
            width={800}
            height={200}
            className="mx-auto h-auto w-full object-contain animate-fade-in"
            unoptimized
          />
        </div>
      </a>
    </div>
  );
}