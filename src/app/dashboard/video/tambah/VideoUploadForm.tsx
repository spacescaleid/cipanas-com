// src/app/dashboard/video/tambah/VideoUploadForm.tsx
"use client";

import { useActionState, useEffect, useState } from "react";
import Image from "next/image";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { Loader2, Send, Link as LinkIcon, Upload, X } from "lucide-react";

import {
  createVideoSchema,
  type CreateVideoInput,
} from "@/lib/video-schema";
import { detectPlatform } from "@/lib/video-platforms";
import { createVideoAction } from "@/actions/video-actions";

export function VideoUploadForm() {
  const [state, formAction, isPending] = useActionState(
    createVideoAction,
    null
  );

  const [thumbnailUrl, setThumbnailUrl] = useState<string>("");
  const [isUploadingThumb, setIsUploadingThumb] = useState(false);

  const {
    register,
    control,
    formState: { errors },
  } = useForm<CreateVideoInput>({
    resolver: zodResolver(createVideoSchema),
    defaultValues: {
      title: "",
      description: "",
      videoUrl: "",
      thumbnailUrl: "",
    },
  });

  const descriptionValue = useWatch({
    control,
    name: "description",
  }) ?? "";

  const videoUrlValue = useWatch({
    control,
    name: "videoUrl",
  }) ?? "";

  // Deteksi platform dari URL yang di-paste
  const detectedPlatform = detectPlatform(videoUrlValue);
  const isInstagram = detectedPlatform === "INSTAGRAM";
  const isTikTok = detectedPlatform === "TIKTOK";
  // Thumbnail field muncul untuk Instagram (wajib) dan TikTok (opsional fallback)
  const showThumbnailField = isInstagram || isTikTok;

  useEffect(() => {
    if (state && !state.success) {
      toast.error(state.error);
    }
  }, [state]);

  async function handleThumbnailUpload(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validasi file
    if (!file.type.startsWith("image/")) {
      toast.error("File harus berupa gambar (JPG, PNG, WebP)");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran gambar maksimal 5MB");
      return;
    }

    setIsUploadingThumb(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "video-thumbnails");
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload gagal");
      setThumbnailUrl(data.url);
      toast.success("Thumbnail berhasil diupload");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload thumbnail gagal");
    } finally {
      setIsUploadingThumb(false);
      e.target.value = "";
    }
  }

  function removeThumbnail() {
    setThumbnailUrl("");
  }

  return (
    <form action={formAction} className="space-y-5">
      {/* Video URL (multi-platform) */}
      <div>
        <label
          htmlFor="videoUrl"
          className="mb-1.5 block text-sm font-semibold text-neutral-700 dark:text-neutral-300"
        >
          URL Video *
        </label>
        <div className="relative">
          <LinkIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            id="videoUrl"
            type="url"
            placeholder="Paste URL dari YouTube, TikTok, atau Instagram..."
            className="w-full rounded-lg border border-neutral-300 bg-white py-2.5 pl-10 pr-3 text-sm text-neutral-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
            {...register("videoUrl")}
          />
        </div>
        {errors.videoUrl && (
          <p className="mt-1 text-xs text-red-500">
            {errors.videoUrl.message}
          </p>
        )}
        <p className="mt-1 text-xs text-neutral-500">
          Support: YouTube, YouTube Shorts, TikTok, Instagram Reels
        </p>
      </div>

      {/* Thumbnail upload — conditional untuk Instagram (wajib) & TikTok (opsional) */}
      {showThumbnailField && (
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-neutral-700 dark:text-neutral-300">
            Thumbnail {isInstagram ? "*" : "(opsional)"}
          </label>

          {/* Hidden input untuk kirim URL ke server action */}
          <input type="hidden" name="thumbnailUrl" value={thumbnailUrl} />

          {thumbnailUrl ? (
            <div className="relative inline-block">
              <div className="relative aspect-video w-64 overflow-hidden rounded-lg border border-neutral-300 dark:border-neutral-700">
                <Image
                  src={thumbnailUrl}
                  alt="Thumbnail preview"
                  fill
                  sizes="256px"
                  className="object-cover"
                  unoptimized
                />
              </div>
              <button
                type="button"
                onClick={removeThumbnail}
                className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                aria-label="Hapus thumbnail"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <label
              className={`inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed px-4 py-3 text-sm transition ${
                isUploadingThumb
                  ? "border-neutral-200 text-neutral-400"
                  : "border-neutral-300 text-neutral-600 hover:border-brand-500 hover:text-brand-600 dark:border-neutral-700 dark:text-neutral-400"
              }`}
            >
              {isUploadingThumb ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Mengupload...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Pilih gambar thumbnail (max 5MB)
                </>
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleThumbnailUpload}
                disabled={isUploadingThumb}
              />
            </label>
          )}

          <p className="mt-1 text-xs text-neutral-500">
            {isInstagram
              ? "Instagram tidak menyediakan thumbnail otomatis. Wajib upload gambar preview manual."
              : "TikTok umumnya auto-fetch thumbnail. Upload manual sebagai fallback (opsional)."}
          </p>
        </div>
      )}

      {/* Title */}
      <div>
        <label
          htmlFor="title"
          className="mb-1.5 block text-sm font-semibold text-neutral-700 dark:text-neutral-300"
        >
          Judul Video *
        </label>
        <input
          id="title"
          type="text"
          placeholder="Contoh: Wisata Puncak Cipanas 2026"
          className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
          {...register("title")}
        />
        {errors.title && (
          <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label
          htmlFor="description"
          className="mb-1.5 block text-sm font-semibold text-neutral-700 dark:text-neutral-300"
        >
          Deskripsi (opsional)
        </label>
        <textarea
          id="description"
          rows={4}
          placeholder="Jelaskan singkat isi video ini..."
          className="w-full resize-y rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
          {...register("description")}
        />
        <div className="mt-1 flex items-center justify-between text-xs">
          {errors.description ? (
            <p className="text-red-500">{errors.description.message}</p>
          ) : (
            <p className="text-neutral-500">Membantu pembaca paham isi video</p>
          )}
          <span className="text-neutral-400">{descriptionValue.length}/1000</span>
        </div>
      </div>

      {/* Submit */}
      <div className="flex items-center justify-end gap-3 border-t border-neutral-200 pt-5 dark:border-neutral-800">
        <button
          type="submit"
          disabled={isPending || isUploadingThumb}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Mengirim...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Kirim untuk Review
            </>
          )}
        </button>
      </div>
    </form>
  );
}