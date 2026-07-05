// src/app/dashboard/video/tambah/VideoUploadForm.tsx
"use client";

import { useActionState, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { Loader2, Send, Link as LinkIcon } from "lucide-react";

import {
  createVideoSchema,
  type CreateVideoInput,
} from "@/lib/video-schema";
import { createVideoAction } from "@/actions/video-actions";

export function VideoUploadForm() {
  const [state, formAction, isPending] = useActionState(
    createVideoAction,
    null
  );

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
    },
  });

  const descriptionValue = useWatch({
    control,
    name: "description",
  }) ?? "";

  useEffect(() => {
    if (state && !state.success) {
      toast.error(state.error);
    }
  }, [state]);

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
          disabled={isPending}
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