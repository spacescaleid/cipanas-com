// src/components/editor/CoverImageUpload.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { Upload, X, Loader2, ImagePlus } from "lucide-react";
import toast from "react-hot-toast";

interface Props {
  value: string;
  onChange: (url: string) => void;
}

export function CoverImageUpload({ value, onChange }: Props) {
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("File harus berupa gambar");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran gambar maksimal 5MB");
      return;
    }

    setUploading(true);

    try {
      // 1. Minta signature dari server
      const signRes = await fetch("/api/upload", { method: "POST" });
      if (!signRes.ok) throw new Error("Gagal mendapatkan signature");
      const { signature, timestamp, folder, apiKey, cloudName } =
        await signRes.json();

      // 2. Upload ke Cloudinary
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
      onChange(uploaded.secure_url);
      toast.success("Gambar berhasil diunggah");
    } catch (error) {
      console.error(error);
      toast.error("Gagal mengunggah gambar");
    } finally {
      setUploading(false);
    }
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = ""; // reset input
  };

  if (value) {
    return (
      <div className="relative overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800">
        <div className="relative aspect-[16/9] bg-neutral-100 dark:bg-neutral-800">
          <Image
            src={value}
            alt="Cover"
            fill
            sizes="(max-width: 768px) 100vw, 800px"
            className="object-cover"
          />
        </div>
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white transition hover:bg-red-600"
          aria-label="Hapus cover"
        >
          <X className="h-4 w-4" />
        </button>
        <label className="absolute bottom-3 right-3 flex cursor-pointer items-center gap-1.5 rounded-lg bg-black/70 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-black/90">
          {uploading ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Upload className="h-3 w-3" />
          )}
          Ganti Gambar
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onInputChange}
            disabled={uploading}
          />
        </label>
      </div>
    );
  }

  return (
    <label className="flex aspect-[16/9] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-50 transition hover:border-brand-500 hover:bg-brand-50 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:border-brand-500 dark:hover:bg-brand-900/20">
      {uploading ? (
        <>
          <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
          <span className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
            Mengunggah...
          </span>
        </>
      ) : (
        <>
          <ImagePlus className="h-10 w-10 text-neutral-400" />
          <span className="mt-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Klik untuk unggah cover
          </span>
          <span className="mt-1 text-xs text-neutral-500">
            JPG/PNG, maksimal 5MB
          </span>
        </>
      )}
      <input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onInputChange}
        disabled={uploading}
      />
    </label>
  );
}