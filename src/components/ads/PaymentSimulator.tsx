// src/components/ads/PaymentSimulator.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle2, ShieldAlert } from "lucide-react";
import toast from "react-hot-toast";

import { paymentMethods, type PaymentMethod } from "@/lib/payment-mock";
import { formatRupiah } from "@/lib/format";
import { cn } from "@/lib/utils";

interface Props {
  orderId: string;
  totalPrice: number;
}

async function safeJson(res: Response): Promise<Record<string, unknown> | null> {
  try {
    const text = await res.text();
    if (!text) return null;
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export function PaymentSimulator({ orderId, totalPrice }: Props) {
  const router = useRouter();
  const [selected, setSelected] = useState<PaymentMethod>("bank_transfer");
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState<null | { paymentRef: string }>(null);

  const handlePay = async () => {
    setProcessing(true);
    try {
      const res = await fetch(`/api/ads/${orderId}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method: selected }),
      });

      const result = await safeJson(res);

      if (!res.ok) {
        const errMsg =
          (result?.error as string) ??
          `Pembayaran gagal (${res.status})`;
        toast.error(errMsg);
        setProcessing(false);
        return;
      }

      if (!result || !result.paymentRef) {
        toast.error("Response tidak valid dari server");
        setProcessing(false);
        return;
      }

      setDone({ paymentRef: result.paymentRef as string });
      toast.success("Pembayaran berhasil!");
      setTimeout(() => router.refresh(), 2000);
    } catch (error) {
      console.error("[PAYMENT_ERROR]", error);
      toast.error("Terjadi kesalahan koneksi");
      setProcessing(false);
    }
  };

  if (done) {
    return (
      <div className="rounded-xl border-2 border-green-400 bg-green-50 p-8 text-center dark:border-green-700 dark:bg-green-900/20">
        <CheckCircle2 className="mx-auto h-16 w-16 text-green-600 dark:text-green-400" />
        <h3 className="mt-4 font-serif text-2xl font-bold text-neutral-900 dark:text-white">
          Pembayaran Berhasil!
        </h3>
        <p className="mt-2 text-sm text-neutral-700 dark:text-neutral-300">
          Iklan Anda sedang menunggu persetujuan admin. Kami akan mengirim email
          notifikasi setelah iklan ditayangkan.
        </p>
        <div className="mt-4 inline-block rounded-lg bg-white px-4 py-2 text-xs dark:bg-neutral-900">
          <span className="text-neutral-500">Ref pembayaran: </span>
          <span className="font-mono font-semibold text-neutral-900 dark:text-white">
            {done.paymentRef}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="rounded-xl border-l-4 border-amber-500 bg-amber-50 p-4 dark:bg-amber-900/20">
        <div className="flex items-start gap-2">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
          <p className="text-xs text-amber-900 dark:text-amber-200">
            <strong>Mode Simulasi</strong> — Ini adalah payment gateway mock.
            Semua pembayaran akan otomatis sukses. Nanti akan diintegrasikan
            dengan Midtrans/Xendit.
          </p>
        </div>
      </div>

      <h3 className="mt-6 font-serif text-lg font-bold text-neutral-900 dark:text-white">
        Pilih Metode Pembayaran
      </h3>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {paymentMethods.map((m) => (
          <button
            key={m.key}
            type="button"
            onClick={() => setSelected(m.key)}
            className={cn(
              "flex items-center gap-3 rounded-xl border-2 p-4 text-left transition",
              selected === m.key
                ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20"
                : "border-neutral-200 bg-white hover:border-brand-300 dark:border-neutral-800 dark:bg-neutral-900"
            )}
          >
            <div className="text-2xl">{m.icon}</div>
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-neutral-900 dark:text-white">
                {m.label}
              </div>
              <div className="text-xs text-neutral-500">{m.description}</div>
            </div>
            <div
              className={cn(
                "h-4 w-4 shrink-0 rounded-full border-2",
                selected === m.key
                  ? "border-brand-600 bg-brand-600"
                  : "border-neutral-300"
              )}
            />
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={handlePay}
        disabled={processing}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 py-3 text-base font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
      >
        {processing ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Memproses Pembayaran...
          </>
        ) : (
          <>Bayar {formatRupiah(totalPrice)}</>
        )}
      </button>
    </div>
  );
}