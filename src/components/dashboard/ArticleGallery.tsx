// src/components/dashboard/ArticleGallery.tsx
"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import Image from "next/image";
import { ImagePlus, Trash2, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

import {
  addArticleImageAction,
  deleteArticleImageAction,
  updateArticleImageFieldsAction, // ← ganti dari updateArticleImageCaptionAction
  getArticleGalleryImages,
} from "@/actions/article-gallery-actions";

// ← TAMBAH title dan overlayText
interface GalleryImage {
  id: string;
  url: string;
  title: string | null;
  overlayText: string | null;
  caption: string | null;
  order: number;
}

interface Props {
  articleId: string;
}

export function ArticleGallery({ articleId }: Props) {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load gallery images — tidak berubah
  useEffect(() => {
    let cancelled = false;

    startTransition(() => {
      setLoading(true);
    });

    getArticleGalleryImages(articleId)
      .then((imgs) => {
        if (!cancelled) setImages(imgs);
      })
      .catch(() => {
        if (!cancelled) toast.error("Gagal memuat galeri");
      })
      .finally(() => {
        if (!cancelled) {
          startTransition(() => {
            setLoading(false);
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [articleId, refreshKey]);

  // Handle file select + upload
  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Format file tidak didukung. Gunakan JPEG, PNG, atau WebP.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran gambar maksimal 5MB");
      return;
    }
    if (images.length >= 10) {
      toast.error("Maksimal 10 gambar per artikel");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataUri = ev.target?.result as string;
      setUploading(true);

      const formData = new FormData();
      formData.set("articleId", articleId);
      formData.set("imageDataUri", dataUri);
      formData.set("title", "");         // ← TAMBAH
      formData.set("overlayText", "");   // ← TAMBAH
      formData.set("caption", "");

      const result = await addArticleImageAction(null, formData);

      if (result.success) {
        toast.success("Gambar berhasil ditambahkan");
        setRefreshKey((k) => k + 1);
      } else {
        toast.error(result.error);
      }

      setUploading(false);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  // ← GANTI: handleFieldBlur update semua field teks sekaligus
  async function handleFieldBlur(
    imageId: string,
    fields: { title?: string; overlayText?: string; caption?: string }
  ) {
    const result = await updateArticleImageFieldsAction(imageId, fields);
    if (!result.success) {
      toast.error(result.error);
    }
  }

  // Handle delete — tidak berubah
  async function handleDelete(imageId: string) {
    if (!confirm("Hapus gambar ini dari galeri?")) return;

    startTransition(async () => {
      const result = await deleteArticleImageAction(imageId);
      if (result.success) {
        toast.success("Gambar dihapus");
        setImages((prev) => prev.filter((img) => img.id !== imageId));
      } else {
        toast.error(result.error);
      }
    });
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
        <div className="h-32 animate-pulse rounded-lg bg-neutral-100 dark:bg-neutral-800" />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
            Galeri Foto ({images.length}/10)
          </h3>
          <p className="mt-0.5 text-xs text-neutral-500">
            Tambahkan foto pendukung untuk artikel ini (maks 10 foto, maks 5MB
            per foto)
          </p>
        </div>

        {images.length < 10 && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
          >
            {uploading ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                Mengupload...
              </>
            ) : (
              <>
                <ImagePlus className="h-3 w-3" />
                Tambah Foto
              </>
            )}
          </button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          className="sr-only"
          aria-label="Upload foto galeri"
        />
      </div>

      {images.length === 0 ? (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex w-full items-center justify-center rounded-lg border-2 border-dashed border-neutral-300 py-10 text-sm text-neutral-500 transition hover:border-brand-500 hover:text-brand-600 dark:border-neutral-700"
        >
          <div className="text-center">
            <ImagePlus className="mx-auto mb-2 h-8 w-8" />
            <p>Klik untuk menambahkan foto pertama</p>
          </div>
        </button>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((img) => (
            <div
              key={img.id}
              className="group relative overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900"
            >
              {/* Foto */}
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={img.url}
                  alt={img.title ?? img.caption ?? "Foto galeri"}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleDelete(img.id)}
                  className="absolute right-2 top-2 rounded-full bg-red-600 p-1.5 text-white opacity-0 transition group-hover:opacity-100 hover:bg-red-700"
                  aria-label="Hapus gambar"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>

              {/*
               * 3 field teks dengan styling berbeda supaya user langsung
               * tahu fungsi masing-masing tanpa membaca label panjang.
               *
               * title      → font-semibold, placeholder menjelaskan posisi
               * overlayText → background amber (warna berbeda = "ini overlay")
               * caption    → text-neutral-500 (terlihat lebih "kecil/sekunder")
               *
               * Semua onBlur — tidak ada auto-save per keystroke supaya
               * tidak spam server action.
               */}
              <div className="space-y-1.5 p-2">
                {/* Judul — bold besar di bawah foto */}
                <input
                  type="text"
                  defaultValue={img.title ?? ""}
                  placeholder="Judul foto (bold, di bawah gambar)..."
                  maxLength={200}
                  onBlur={(e) =>
                    handleFieldBlur(img.id, { title: e.target.value })
                  }
                  className="w-full rounded border border-neutral-200 bg-white px-2 py-1 text-xs font-semibold text-neutral-900 outline-none transition focus:border-brand-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
                {/* Overlay text — teks DI ATAS foto */}
                <input
                  type="text"
                  defaultValue={img.overlayText ?? ""}
                  placeholder="Teks overlay (di atas foto, ukuran auto)..."
                  maxLength={300}
                  onBlur={(e) =>
                    handleFieldBlur(img.id, { overlayText: e.target.value })
                  }
                  className="w-full rounded border border-amber-300 bg-amber-50 px-2 py-1 text-xs text-neutral-700 outline-none transition focus:border-amber-500 dark:border-amber-800 dark:bg-amber-950/30 dark:text-neutral-300"
                />
                {/* Caption — deskripsi kecil di bawah judul */}
                <input
                  type="text"
                  defaultValue={img.caption ?? ""}
                  placeholder="Caption (kecil, normal, di bawah judul)..."
                  maxLength={500}
                  onBlur={(e) =>
                    handleFieldBlur(img.id, { caption: e.target.value })
                  }
                  className="w-full rounded border border-neutral-200 bg-white px-2 py-1 text-xs text-neutral-500 outline-none transition focus:border-brand-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}