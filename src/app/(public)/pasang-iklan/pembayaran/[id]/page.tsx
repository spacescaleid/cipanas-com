// src/app/(public)/pasang-iklan/pembayaran/[id]/page.tsx
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import { Clock } from "lucide-react";

import { getAdOrderById } from "@/lib/ad-queries";
import { PaymentSimulator } from "@/components/ads/PaymentSimulator";
import { formatRupiah, formatDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "Pembayaran Iklan — Cipanas.com",
};

export default async function PembayaranPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getAdOrderById(id);
  if (!order) notFound();

  const alreadyPaid = order.status !== "PENDING_PAYMENT";

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-6">
        <h1 className="font-serif text-3xl font-bold text-neutral-900 dark:text-white">
          Pembayaran
        </h1>
        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
          Order ID:{" "}
          <span className="font-mono text-xs">{order.id.substring(0, 8)}…</span>
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Payment area */}
        <div className="lg:col-span-2">
          {alreadyPaid ? (
            <div className="rounded-xl border-2 border-green-400 bg-green-50 p-8 text-center dark:border-green-700 dark:bg-green-900/20">
              <Clock className="mx-auto h-16 w-16 text-green-600 dark:text-green-400" />
              <h3 className="mt-4 font-serif text-2xl font-bold text-neutral-900 dark:text-white">
                {order.status === "PENDING_APPROVAL"
                  ? "Menunggu Persetujuan Admin"
                  : order.status === "ACTIVE"
                  ? "Iklan Sedang Aktif"
                  : "Order Sudah Diproses"}
              </h3>
              <p className="mt-2 text-sm text-neutral-700 dark:text-neutral-300">
                Status order:{" "}
                <strong className="text-brand-700 dark:text-brand-400">
                  {order.status}
                </strong>
              </p>
              {order.payments[0] && (
                <div className="mt-4 inline-block rounded-lg bg-white px-4 py-2 text-xs dark:bg-neutral-900">
                  <span className="text-neutral-500">Ref: </span>
                  <span className="font-mono font-semibold text-neutral-900 dark:text-white">
                    {order.payments[0].paymentRef}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <PaymentSimulator
              orderId={order.id}
              totalPrice={Number(order.totalPrice)}
            />
          )}
        </div>

        {/* Ringkasan */}
        <div>
          <div className="lg:sticky lg:top-24 rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
            <h3 className="font-serif text-base font-bold text-neutral-900 dark:text-white">
              Detail Pesanan
            </h3>

            {/* Preview materi */}
            <div className="mt-3 rounded-lg border border-neutral-200 bg-neutral-50 p-3 dark:border-neutral-800 dark:bg-neutral-950">
              <Image
                src={order.mediaUrl}
                alt="Preview iklan"
                width={400}
                height={200}
                className="mx-auto max-h-32 w-auto rounded"
                unoptimized
              />
            </div>

            <dl className="mt-4 space-y-2 text-xs">
              <div className="flex justify-between">
                <dt className="text-neutral-500">Pengiklan</dt>
                <dd className="font-semibold text-neutral-900 dark:text-white">
                  {order.advertiserName}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-neutral-500">Posisi</dt>
                <dd className="font-semibold text-neutral-900 dark:text-white">
                  {order.slot.position}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-neutral-500">Ukuran</dt>
                <dd className="font-mono text-neutral-900 dark:text-white">
                  {order.slot.size}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-neutral-500">Mulai</dt>
                <dd className="text-neutral-900 dark:text-white">
                  {formatDate(order.startDate)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-neutral-500">Berakhir</dt>
                <dd className="text-neutral-900 dark:text-white">
                  {formatDate(order.endDate)}
                </dd>
              </div>
            </dl>

            <div className="mt-4 flex items-baseline justify-between border-t border-neutral-200 pt-3 dark:border-neutral-800">
              <span className="text-sm font-semibold text-neutral-900 dark:text-white">
                Total
              </span>
              <span className="font-serif text-lg font-bold text-brand-700 dark:text-brand-400">
                {formatRupiah(Number(order.totalPrice))}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}