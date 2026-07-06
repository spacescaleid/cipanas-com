// src/components/article/ArticleGallery.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface SlideImage {
  id: string;
  url: string;
  caption: string | null;
}

interface Props {
  images: SlideImage[];
  fallbackCover?: string | null;
  articleTitle: string;
}

function getOverlayFontClass(text: string): string {
  const len = text.length;
  if (len <= 15) return "text-3xl md:text-5xl lg:text-6xl font-bold";
  if (len <= 30) return "text-2xl md:text-4xl lg:text-5xl font-bold";
  if (len <= 60) return "text-xl md:text-3xl lg:text-4xl font-bold";
  if (len <= 100) return "text-lg md:text-2xl lg:text-3xl font-semibold";
  return "text-base md:text-xl lg:text-2xl font-semibold";
}

export function ArticleGallery({
  images,
  fallbackCover,
  articleTitle,
}: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const hasSlides = images.length > 0;
  const totalSlides = hasSlides ? images.length : fallbackCover ? 1 : 0;

  const goNext = useCallback(() => {
    if (totalSlides <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const goPrev = useCallback(() => {
    if (totalSlides <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  useEffect(() => {
    if (totalSlides <= 1 || isPaused) return;
    const interval = setInterval(goNext, 5000);
    return () => clearInterval(interval);
  }, [totalSlides, isPaused, goNext]);

  // Early returns SETELAH semua hooks
  if (totalSlides === 0) return null;

  // Single cover fallback
  if (!hasSlides && fallbackCover) {
    return (
      <div className="relative aspect-[16/9] overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-800">
        <Image
          src={fallbackCover}
          alt={articleTitle}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 66vw"
          className="object-cover"
        />
      </div>
    );
  }

  const currentSlide = images[currentIndex];
  if (!currentSlide) return null;

  return (
    <div
      className="relative overflow-hidden rounded-xl bg-neutral-900"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="relative aspect-[16/9]">
        <Image
          key={currentSlide.id}
          src={currentSlide.url}
          alt={currentSlide.caption ?? articleTitle}
          fill
          priority={currentIndex === 0}
          sizes="(max-width: 1024px) 100vw, 66vw"
          className="object-cover animate-fade-in"
        />

        {currentSlide.caption && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        )}

        {currentSlide.caption && (
          <div className="absolute inset-x-0 bottom-0 p-6 md:p-10">
            <p
              className={`text-white drop-shadow-lg leading-tight ${getOverlayFontClass(
                currentSlide.caption
              )}`}
            >
              {currentSlide.caption}
            </p>
          </div>
        )}
      </div>

      {totalSlides > 1 && (
        <>
          <button
            type="button"
            onClick={goPrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white backdrop-blur-sm transition hover:bg-black/60"
            aria-label="Foto sebelumnya"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={goNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white backdrop-blur-sm transition hover:bg-black/60"
            aria-label="Foto berikutnya"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      {totalSlides > 1 && (
        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
          {images.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              className={`h-2 rounded-full transition-all ${
                idx === currentIndex
                  ? "w-6 bg-white"
                  : "w-2 bg-white/50 hover:bg-white/75"
              }`}
              aria-label={`Foto ${idx + 1}`}
            />
          ))}
        </div>
      )}

      {totalSlides > 1 && (
        <div className="absolute right-3 top-3 rounded-full bg-black/50 px-2.5 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
          {currentIndex + 1} / {totalSlides}
        </div>
      )}
    </div>
  );
}