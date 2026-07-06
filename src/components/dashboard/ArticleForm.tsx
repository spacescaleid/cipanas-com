// src/components/dashboard/ArticleForm.tsx
"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import Image from "next/image";
import {
  Loader2,
  Save,
  Send,
  ArrowLeft,
  ImagePlus,
  Trash2,
} from "lucide-react";
import Link from "next/link";

import { articleFormSchema, type ArticleFormData } from "@/lib/article-schema";
import { TiptapEditor } from "@/components/editor/TiptapEditor";
import { CoverImageUpload } from "@/components/editor/CoverImageUpload";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import type { ArticleStatus } from "@prisma/client";

interface Category {
  id: string;
  name: string;
}

interface GalleryPhoto {
  url: string;
  title: string;
  caption: string;
  tempId: string;
}

interface Props {
  categories: Category[];
  initialData?: {
    id: string;
    title: string;
    content: string;
    coverImage: string | null;
    categoryId: string;
    status: ArticleStatus;
    revisionNote: string | null;
  };
  initialGallery?: Array<{
    id: string;
    url: string;
    title?: string | null;
    caption: string | null;
  }>;
}

export function ArticleForm({
  categories,
  initialData,
  initialGallery,
}: Props) {
  const router = useRouter();
  const isEdit = !!initialData;
  const [submitting, setSubmitting] = useState<"DRAFT" | "PENDING" | null>(
    null
  );
  const [galleryPhotos, setGalleryPhotos] = useState<GalleryPhoto[]>(
    initialGallery?.map((img) => ({
      url: img.url,
      title: img.title ?? "",
      caption: img.caption ?? "",
      tempId: img.id,
    })) ?? []
  );
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<ArticleFormData>({
    resolver: zodResolver(articleFormSchema),
    defaultValues: {
      title: initialData?.title ?? "",
      content: initialData?.content ?? "",
      coverImage: initialData?.coverImage ?? "",
      categoryId: initialData?.categoryId ?? "",
    },
  });

  const handleGalleryUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("File harus berupa gambar");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran gambar maksimal 5MB");
      return;
    }
    if (galleryPhotos.length >= 10) {
      toast.error("Maksimal 10 foto per artikel");
      return;
    }

    setUploading(true);
    try {
      const signRes = await fetch("/api/upload", { method: "POST" });
      if (!signRes.ok) throw new Error("Gagal mendapatkan signature");
      const { signature, timestamp, folder, apiKey, cloudName } =
        await signRes.json();

      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", apiKey);
      formData.append("timestamp", String(timestamp));
      formData.append("signature", signature);
      formData.append("folder", folder);

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: "POST", body: formData }
      );

      if (!uploadRes.ok) throw new Error("Upload gagal");
      const uploaded = await uploadRes.json();

      setGalleryPhotos((prev) => [
        ...prev,
        {
          url: uploaded.secure_url,
          title: "",
          caption: "",
          tempId: `temp-${Date.now()}-${Math.random()}`,
        },
      ]);
      toast.success("Foto ditambahkan");
    } catch (error) {
      console.error(error);
      toast.error("Gagal mengunggah foto");
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = (tempId: string) => {
    setGalleryPhotos((prev) => prev.filter((p) => p.tempId !== tempId));
  };

  const handleFieldChange = (
    tempId: string,
    field: "title" | "caption",
    value: string
  ) => {
    setGalleryPhotos((prev) =>
      prev.map((p) => (p.tempId === tempId ? { ...p, [field]: value } : p))
    );
  };

  const submit = async (action: "DRAFT" | "PENDING") => {
    const valid = await new Promise<boolean>((resolve) => {
      handleSubmit(
        () => resolve(true),
        () => resolve(false)
      )();
    });
    if (!valid) {
      toast.error("Periksa kembali form Anda");
      return;
    }

    setSubmitting(action);
    const data = getValues();

    try {
      const url = isEdit ? `/api/articles/${initialData.id}` : "/api/articles";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          action,
          galleryPhotos: galleryPhotos.map((p, i) => ({
            url: p.url,
            title: p.title,
            caption: p.caption,
            order: i,
          })),
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error ?? "Gagal menyimpan");
        setSubmitting(null);
        return;
      }

      toast.success(result.message);
      router.push("/dashboard/tulisan");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Terjadi kesalahan");
      setSubmitting(null);
    }
  };

  return (
    <form className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/tulisan"
          className="flex items-center gap-2 text-sm text-neutral-600 hover:text-brand-600 dark:text-neutral-400"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali
        </Link>
        {isEdit && <StatusBadge status={initialData.status} />}
      </div>

      {/* Note revisi */}
      {isEdit &&
        initialData.status === "REVISION" &&
        initialData.revisionNote && (
          <div className="rounded-lg border-l-4 border-accent-500 bg-accent-50 p-4 dark:bg-accent-900/20">
            <div className="text-xs font-semibold uppercase tracking-wider text-accent-700 dark:text-accent-300">
              Catatan Revisi dari Admin
            </div>
            <p className="mt-1 text-sm text-neutral-700 dark:text-neutral-300">
              {initialData.revisionNote}
            </p>
          </div>
        )}

      {/* Title */}
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-neutral-700 dark:text-neutral-300">
          Judul Berita
        </label>
        <input
          type="text"
          placeholder="Judul yang menarik dan informatif..."
          className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 font-serif text-xl font-bold text-neutral-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
          {...register("title")}
        />
        {errors.title && (
          <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>
        )}
      </div>

      {/* Category */}
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-neutral-700 dark:text-neutral-300">
          Kategori
        </label>
        <select
          className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
          {...register("categoryId")}
        >
          <option value="">-- Pilih Kategori --</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        {errors.categoryId && (
          <p className="mt-1 text-xs text-red-500">
            {errors.categoryId.message}
          </p>
        )}
      </div>

      {/* Cover Image */}
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-neutral-700 dark:text-neutral-300">
          Gambar Cover
        </label>
        <Controller
          control={control}
          name="coverImage"
          render={({ field }) => (
            <CoverImageUpload
              value={field.value ?? ""}
              onChange={field.onChange}
            />
          )}
        />
      </div>

      {/* ⭐ Gallery Foto — selalu muncul */}
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-neutral-700 dark:text-neutral-300">
          Foto Sampul ({galleryPhotos.length}/10)
        </label>

        {galleryPhotos.length > 0 && (
          <div className="mb-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {galleryPhotos.map((photo) => (
              <div
                key={photo.tempId}
                className="group relative overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={photo.url}
                    alt={photo.title || photo.caption || "Foto"}
                    fill
                    sizes="(max-width: 640px) 100vw, 33vw"
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleDeletePhoto(photo.tempId)}
                    className="absolute right-2 top-2 rounded-full bg-red-600 p-1.5 text-white opacity-0 transition group-hover:opacity-100 hover:bg-red-700"
                    aria-label="Hapus foto"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
                {/* Title + Caption inputs */}
                <div className="space-y-1.5 p-2">
                  <input
                    type="text"
                    value={photo.title}
                    onChange={(e) =>
                      handleFieldChange(photo.tempId, "title", e.target.value)
                    }
                    placeholder="Judul gambar (bold)..."
                    maxLength={200}
                    className="w-full rounded border border-neutral-200 bg-white px-2 py-1 text-xs font-bold text-neutral-900 outline-none focus:border-brand-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  />
                  <input
                    type="text"
                    value={photo.caption}
                    onChange={(e) =>
                      handleFieldChange(photo.tempId, "caption", e.target.value)
                    }
                    placeholder="Deskripsi gambar..."
                    maxLength={500}
                    className="w-full rounded border border-neutral-200 bg-white px-2 py-1 text-xs text-neutral-500 outline-none focus:border-brand-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400"
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {galleryPhotos.length < 10 && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-neutral-300 py-6 text-sm text-neutral-500 transition hover:border-brand-500 hover:text-brand-600 disabled:opacity-50 dark:border-neutral-700"
          >
            {uploading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Mengupload...
              </>
            ) : (
              <>
                <ImagePlus className="h-5 w-5" />
                Tambah Foto ({galleryPhotos.length}/10)
              </>
            )}
          </button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleGalleryUpload(file);
            e.target.value = "";
          }}
          className="sr-only"
          aria-label="Upload foto"
        />

        <p className="mt-1 text-xs text-neutral-500">
          Maks 10 foto, 5MB/foto. Setiap foto bisa punya judul (bold) + deskripsi.
        </p>
      </div>

      {/* Content Editor */}
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-neutral-700 dark:text-neutral-300">
          Konten
        </label>
        <Controller
          control={control}
          name="content"
          render={({ field }) => (
            <TiptapEditor value={field.value} onChange={field.onChange} />
          )}
        />
        {errors.content && (
          <p className="mt-1 text-xs text-red-500">{errors.content.message}</p>
        )}
      </div>

      {/* Actions */}
      <div className="sticky bottom-0 -mx-4 flex flex-wrap gap-3 border-t border-neutral-200 bg-white/95 px-4 py-4 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/95 sm:mx-0 sm:rounded-xl sm:border sm:px-6">
        <button
          type="button"
          onClick={() => submit("DRAFT")}
          disabled={submitting !== null}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50 disabled:opacity-60 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 sm:flex-none"
        >
          {submitting === "DRAFT" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Simpan Draft
        </button>
        <button
          type="button"
          onClick={() => submit("PENDING")}
          disabled={submitting !== null}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60 sm:flex-none"
        >
          {submitting === "PENDING" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          Kirim untuk Review
        </button>
      </div>
    </form>
  );
}