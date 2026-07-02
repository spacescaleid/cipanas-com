// src/app/upload-iklan/[token]/UploadForm.tsx
"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { AD_SLOT_CONFIG } from "@/types/ad-order";
import type { AdPosition, AdOrderStatus } from "@prisma/client";
import { submitCreativeAction } from "@/actions/ad-order-actions";

type ActionResult =
  | { success: true; data: void }
  | { success: false; error: string };

// Tipe explicit — TIDAK accept unknown, harus number/string primitives
interface OrderSlotInfo {
  id: string;
  position: AdPosition;
  size: string;
  label?: string | null;
  pricePerDay: number; // ← EKSPLISIT number
  isActive?: boolean;
}

interface OrderForUpload {
  id: string;
  orderCode: string | null;
  status: AdOrderStatus;
  startDate: Date | string;
  endDate: Date | string;
  rejectionReason: string | null;
  uploadTokenExpiresAt: Date | string | null;
  imageUrl: string | null;
  targetUrl: string | null;
  altText: string | null;
  totalPrice: number; // ← EKSPLISIT number (kalau ada di prop)
  slot: OrderSlotInfo;
}

const clientSchema = z.object({
  targetUrl: z
    .string()
    .url("URL tidak valid")
    .refine((v) => v.startsWith("https://"), "Harus HTTPS"),
  altText: z.string().max(200).optional(),
});

type ClientFormValues = z.infer<typeof clientSchema>;

interface UploadFormProps {
  order: OrderForUpload;
  token: string;
}

export function UploadForm({ order, token }: UploadFormProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageDataUri, setImageDataUri] = useState<string>("");
  const [imageMeta, setImageMeta] = useState<{
    width: number;
    height: number;
    sizeBytes: number;
  } | null>(null);
  const [imageError, setImageError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const slotConfig = AD_SLOT_CONFIG[order.slot.position];
  const MAX_SIZE_BYTES = (slotConfig?.maxFileSizeMB ?? 1) * 1024 * 1024;

  const [state, formAction, isPending] = useActionState<
    ActionResult | null,
    FormData
  >(async (prevState, formData) => {
    return submitCreativeAction(token, prevState, formData);
  }, null);

  const {
    register,
    formState: { errors },
  } = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
  });

  useEffect(() => {
    if (state?.success) {
      toast.success(
        "Materi iklan berhasil diupload! Admin akan mereview dalam 1×24 jam."
      );
    } else if (state && !state.success && state.error) {
      toast.error(state.error);
    }
  }, [state]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageError("");

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setImageError(
        "Format file tidak didukung. Gunakan JPEG, PNG, atau WebP."
      );
      return;
    }

    if (file.size > MAX_SIZE_BYTES) {
      setImageError(
        `Ukuran file terlalu besar (maks. ${slotConfig?.maxFileSizeMB ?? 1}MB)`
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUri = ev.target?.result as string;
      const img = new Image();
      img.onload = () => {
        setImageMeta({
          width: img.naturalWidth,
          height: img.naturalHeight,
          sizeBytes: file.size,
        });
        setImageDataUri(dataUri);
        setPreviewUrl(dataUri);
      };
      img.src = dataUri;
    };
    reader.readAsDataURL(file);
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  if (state?.success) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/40 mb-4">
          <svg
            className="w-8 h-8 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Upload Berhasil!
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Materi iklan Anda sedang direview admin. Proses maks. 1×24 jam.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="imageDataUri" value={imageDataUri} />
      <input type="hidden" name="imageWidth" value={imageMeta?.width ?? 0} />
      <input
        type="hidden"
        name="imageHeight"
        value={imageMeta?.height ?? 0}
      />
      <input
        type="hidden"
        name="imageSizeBytes"
        value={imageMeta?.sizeBytes ?? 0}
      />

      <input
        ref={fileInputRef}
        id="ad-image-file"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        aria-label="Pilih file gambar banner iklan"
        className="sr-only"
      />

      {order.rejectionReason && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
          <p className="text-sm font-semibold text-red-800 dark:text-red-200 mb-1">
            ❌ Materi sebelumnya ditolak
          </p>
          <p className="text-sm text-red-700 dark:text-red-300">
            <strong>Alasan:</strong> {order.rejectionReason}
          </p>
          <p className="text-xs text-red-600 dark:text-red-400 mt-1">
            Upload materi baru di bawah ini.
          </p>
        </div>
      )}

      <div>
        <p className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          File Gambar Banner *
        </p>

        {slotConfig && (
          <div className="mb-3 text-xs text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg px-3 py-2">
            📐 Posisi <strong>{slotConfig.label}</strong>:{" "}
            {slotConfig.sizes.join(", ")} pixel | Maks.{" "}
            {slotConfig.maxFileSizeMB}MB | {slotConfig.aspectRatioHint}
          </div>
        )}

        <button
          type="button"
          onClick={openFilePicker}
          className={`
            w-full rounded-xl border-2 border-dashed p-6 text-center transition-colors
            ${
              previewUrl
                ? "border-green-300 dark:border-green-700 bg-green-50/30 dark:bg-green-900/10"
                : "border-gray-300 dark:border-gray-600 hover:border-blue-400 bg-white dark:bg-gray-900"
            }
          `}
        >
          {previewUrl ? (
            <div className="space-y-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="Preview"
                className="mx-auto max-h-32 object-contain rounded"
              />
              {imageMeta && (
                <p className="text-xs text-gray-500">
                  {imageMeta.width}×{imageMeta.height}px •{" "}
                  {(imageMeta.sizeBytes / 1024).toFixed(0)}KB
                </p>
              )}
              <p className="text-xs text-blue-600 dark:text-blue-400">
                Klik untuk ganti gambar
              </p>
            </div>
          ) : (
            <div>
              <svg
                className="mx-auto h-10 w-10 text-gray-400 mb-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Klik untuk pilih file gambar
              </p>
              <p className="text-xs text-gray-400 mt-1">JPEG, PNG, WebP</p>
            </div>
          )}
        </button>

        {imageError && (
          <p className="mt-1 text-xs text-red-600">{imageError}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="targetUrl"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          URL Tujuan (saat iklan diklik) *
        </label>
        <input
          {...register("targetUrl")}
          id="targetUrl"
          name="targetUrl"
          type="url"
          placeholder="https://toko-anda.com"
          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.targetUrl && (
          <p className="mt-1 text-xs text-red-600">
            {errors.targetUrl.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="altText"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Nama Campaign / Teks Alt (opsional)
        </label>
        <input
          {...register("altText")}
          id="altText"
          name="altText"
          type="text"
          placeholder="Promo Lebaran Toko Budi Jaya"
          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="mt-1 text-xs text-gray-500">
          Dipakai untuk aksesibilitas dan laporan performa
        </p>
      </div>

      <button
        type="submit"
        disabled={isPending || !imageDataUri || !!imageError}
        className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white disabled:text-gray-500 font-semibold py-3 px-6 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        {isPending ? (
          <span className="flex items-center justify-center gap-2">
            <svg
              className="h-4 w-4 animate-spin"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Mengupload...
          </span>
        ) : (
          "Upload Materi Iklan"
        )}
      </button>
    </form>
  );
}