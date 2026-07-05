// src/components/article/ArticleGallery.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, Images } from "lucide-react";

interface GalleryImage {
  id: string;
  url: string;
  caption: string | null;
}

interface Props {
  images: GalleryImage[];
}

export function ArticleGallery({ images }: Props) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (images.length === 0) return null;

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);

  const goNext = () => {
    if (lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex + 1) % images.length);
  };

  const goPrev = () => {
    if (lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex - 1 + images.length) % images.length);
  };

  return (
    <>
      {/* Section Header */}
      <div className="mb-4 flex items-center gap-2">
        <Images className="h-5 w-5 text-brand-600 dark:text-brand-400" />
        <h2 className="font-serif text-xl font-bold text-neutral-900 dark:text-white">
          Galeri Foto ({images.length})
        </h2>
      </div>

      {/* Grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {images.map((img, idx) => (
          <button
            key={img.id}
            type="button"
            onClick={() => openLightbox(idx)}
            className="group relative overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100 transition hover:shadow-lg dark:border-neutral-800 dark:bg-neutral-900"
          >
            <div className="relative aspect-[4/3]">
              <Image
                src={img.url}
                alt={img.caption ?? `Foto ${idx + 1}`}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover transition duration-300 group-hover:scale-105"
              />
              {/* Hover overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/20">
                <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-neutral-700 opacity-0 transition group-hover:opacity-100">
                  Lihat
                </span>
              </div>
            </div>
            {img.caption && (
              <p className="px-3 py-2 text-left text-xs text-neutral-600 dark:text-neutral-400">
                {img.caption}
              </p>
            )}
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={closeLightbox}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={closeLightbox}
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            aria-label="Tutup"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Prev button */}
          {images.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goPrev();
              }}
              className="absolute left-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
              aria-label="Foto sebelumnya"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}

          {/* Image */}
          <div
            className="relative max-h-[85vh] max-w-[90vw]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[lightboxIndex].url}
              alt={images[lightboxIndex].caption ?? "Foto galeri"}
              width={1200}
              height={800}
              className="max-h-[80vh] w-auto rounded-lg object-contain"
              unoptimized
            />
            {images[lightboxIndex].caption && (
              <p className="mt-3 text-center text-sm text-white/80">
                {images[lightboxIndex].caption}
              </p>
            )}
            <p className="mt-1 text-center text-xs text-white/50">
              {lightboxIndex + 1} / {images.length}
            </p>
          </div>

          {/* Next button */}
          {images.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goNext();
              }}
              className="absolute right-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
              aria-label="Foto berikutnya"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          )}
        </div>
      )}
    </>
  );
}