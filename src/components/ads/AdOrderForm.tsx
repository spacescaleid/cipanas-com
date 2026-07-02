// src/components/ads/AdOrderForm.tsx
"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { Loader2, ArrowLeft, ArrowRight, Calendar } from "lucide-react";

import { formatRupiah } from "@/lib/format";
import { AdMediaUpload } from "./AdMediaUpload";

const formSchema = z.object({
  advertiserName: z.string().min(2, "Nama minimal 2 karakter").max(100),
  email: z.string().email("Email tidak valid"),
  mediaUrl: z.string().url("Upload materi dulu"),
  targetUrl: z.string().url("URL tujuan tidak valid"),
  startDate: z.string().min(1, "Pilih tanggal mulai"),
  endDate: z.string().min(1, "Pilih tanggal berakhir"),
});

type FormData = z.infer<typeof formSchema>;

interface Props {
  slot: {
    id: string;
    position: string;
    size: string;
    pricePerDay: number;
  };
}

/** Safely parse JSON response; return null kalau gagal */
async function safeJson(res: Response): Promise<Record<string, unknown> | null> {
  try {
    const text = await res.text();
    if (!text) return null;
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export function AdOrderForm({ slot }: Props) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  const defaultEnd = new Date(today);
  defaultEnd.setDate(defaultEnd.getDate() + 7);
  const defaultEndStr = defaultEnd.toISOString().slice(0, 10);

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      advertiserName: "",
      email: "",
      mediaUrl: "",
      targetUrl: "",
      startDate: todayStr,
      endDate: defaultEndStr,
    },
  });

  const startDate = watch("startDate");
  const endDate = watch("endDate");

  const { durationDays, totalPrice } = useMemo(() => {
    if (!startDate || !endDate) return { durationDays: 0, totalPrice: 0 };
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil(
      (end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)
    );
    return {
      durationDays: days > 0 ? days : 0,
      totalPrice: days > 0 ? slot.pricePerDay * days : 0,
    };
  }, [startDate, endDate, slot.pricePerDay]);

  const onSubmit = async (data: FormData) => {
    if (durationDays < 1) {
      toast.error("Durasi minimal 1 hari");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...data,
        slotId: slot.id,
        startDate: new Date(data.startDate).toISOString(),
        endDate: new Date(data.endDate).toISOString(),
      };

      console.log("[SUBMIT_ORDER_PAYLOAD]", payload);

      const res = await fetch("/api/ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await safeJson(res);
      console.log("[SUBMIT_ORDER_RESPONSE]", res.status, result);

      if (!res.ok) {
        const errMsg =
          (result?.error as string) ??
          (result?.detail as string) ??
          `Gagal membuat order (${res.status})`;
        toast.error(errMsg);
        setSubmitting(false);
        return;
      }

      if (!result || !result.order) {
        toast.error("Response tidak valid dari server");
        setSubmitting(false);
        return;
      }

      const order = result.order as { id: string };
      toast.success("Order dibuat, lanjut pembayaran");
      router.push(`/pasang-iklan/pembayaran/${order.id}`);
    } catch (error) {
      console.error("[SUBMIT_ORDER_EXCEPTION]", error);
      toast.error("Terjadi kesalahan koneksi");
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-8 lg:grid-cols-3">
      {/* Form kiri */}
      <div className="space-y-5 lg:col-span-2">
        <Link
          href="/pasang-iklan"
          className="inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-brand-600 dark:text-neutral-400"
        >
          <ArrowLeft className="h-4 w-4" />
          Ganti paket iklan
        </Link>

        <div>
          <h1 className="font-serif text-3xl font-bold text-neutral-900 dark:text-white">
            Pesan Iklan
          </h1>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            Isi form di bawah untuk memesan slot iklan{" "}
            <strong>{slot.position}</strong>.
          </p>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
          {/* Nama */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-neutral-700 dark:text-neutral-300">
              Nama Pengiklan / Perusahaan
            </label>
            <input
              type="text"
              placeholder="PT Contoh Sejahtera"
              className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
              {...register("advertiserName")}
            />
            {errors.advertiserName && (
              <p className="mt-1 text-xs text-red-500">
                {errors.advertiserName.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="mt-4">
            <label className="mb-1.5 block text-sm font-semibold text-neutral-700 dark:text-neutral-300">
              Email Kontak
            </label>
            <input
              type="email"
              placeholder="kontak@perusahaan.com"
              className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
              {...register("email")}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
            )}
          </div>

          {/* Target URL */}
          <div className="mt-4">
            <label className="mb-1.5 block text-sm font-semibold text-neutral-700 dark:text-neutral-300">
              URL Tujuan (saat iklan diklik)
            </label>
            <input
              type="url"
              placeholder="https://website-anda.com"
              className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
              {...register("targetUrl")}
            />
            {errors.targetUrl && (
              <p className="mt-1 text-xs text-red-500">
                {errors.targetUrl.message}
              </p>
            )}
          </div>

          {/* Tanggal */}
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                Tanggal Mulai
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                <input
                  type="date"
                  min={todayStr}
                  className="w-full rounded-lg border border-neutral-300 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                  {...register("startDate")}
                />
              </div>
              {errors.startDate && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.startDate.message}
                </p>
              )}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                Tanggal Berakhir
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                <input
                  type="date"
                  min={startDate || todayStr}
                  className="w-full rounded-lg border border-neutral-300 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                  {...register("endDate")}
                />
              </div>
              {errors.endDate && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.endDate.message}
                </p>
              )}
            </div>
          </div>

          {/* Media Upload */}
          <div className="mt-4">
            <label className="mb-1.5 block text-sm font-semibold text-neutral-700 dark:text-neutral-300">
              Materi Iklan
            </label>
            <Controller
              control={control}
              name="mediaUrl"
              render={({ field }) => (
                <AdMediaUpload
                  value={field.value}
                  onChange={field.onChange}
                  size={slot.size}
                />
              )}
            />
            {errors.mediaUrl && (
              <p className="mt-1 text-xs text-red-500">
                {errors.mediaUrl.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Ringkasan kanan */}
      <div>
        <div className="lg:sticky lg:top-24">
          <div className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
            <h3 className="font-serif text-lg font-bold text-neutral-900 dark:text-white">
              Ringkasan Pesanan
            </h3>

            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between border-b border-neutral-100 pb-2 dark:border-neutral-800">
                <dt className="text-neutral-500">Posisi</dt>
                <dd className="font-semibold text-neutral-900 dark:text-white">
                  {slot.position}
                </dd>
              </div>
              <div className="flex justify-between border-b border-neutral-100 pb-2 dark:border-neutral-800">
                <dt className="text-neutral-500">Ukuran</dt>
                <dd className="font-mono text-neutral-900 dark:text-white">
                  {slot.size}
                </dd>
              </div>
              <div className="flex justify-between border-b border-neutral-100 pb-2 dark:border-neutral-800">
                <dt className="text-neutral-500">Harga/hari</dt>
                <dd className="font-semibold text-neutral-900 dark:text-white">
                  {formatRupiah(slot.pricePerDay)}
                </dd>
              </div>
              <div className="flex justify-between border-b border-neutral-100 pb-2 dark:border-neutral-800">
                <dt className="text-neutral-500">Durasi</dt>
                <dd className="font-semibold text-neutral-900 dark:text-white">
                  {durationDays} hari
                </dd>
              </div>
              <div className="flex justify-between pt-2">
                <dt className="text-base font-semibold text-neutral-900 dark:text-white">
                  Total
                </dt>
                <dd className="font-serif text-xl font-bold text-brand-700 dark:text-brand-400">
                  {formatRupiah(totalPrice)}
                </dd>
              </div>
            </dl>

            <button
              type="submit"
              disabled={submitting || durationDays < 1}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 py-3 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Lanjut ke Pembayaran
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>

            <p className="mt-3 text-center text-xs text-neutral-500">
              Iklan akan tayang setelah pembayaran & persetujuan admin.
            </p>
          </div>
        </div>
      </div>
    </form>
  );
}