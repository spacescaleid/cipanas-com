// src/app/pasang-iklan/[orderCode]/instruksi/page.tsx

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { AdStatusBadge } from "@/components/ads/AdStatusBadge";
import {
  formatRupiah,
  formatDate,
  buildWhatsAppLink,
  buildPaymentConfirmationMessage,
} from "@/lib/ad-utils";
import { AD_SLOT_CONFIG } from "@/types/ad-order";
import { CopyButton } from "@/components/ui/CopyButton";
import { serializePrisma } from "@/lib/serialize";

interface Props {
  params: Promise<{ orderCode: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { orderCode } = await params;
  return {
    title: `Instruksi Pembayaran ${orderCode} — Cipanas.com`,
    robots: "noindex",
  };
}

const PAYMENT_INFO = {
  bankName: process.env.PAYMENT_BANK_NAME ?? "BCA",
  accountNumber: process.env.PAYMENT_ACCOUNT_NUMBER ?? "1234567890",
  accountName: process.env.PAYMENT_ACCOUNT_NAME ?? "Admin Cipanas",
  qrisImageUrl: process.env.PAYMENT_QRIS_URL ?? null,
};

export default async function InstruksiPembayaranPage({ params }: Props) {
  const { orderCode } = await params;

  const orderRaw = await prisma.adOrder.findUnique({
    where: { orderCode },
    include: { slot: true },
  });

  if (!orderRaw) notFound();

  // ⚠️ SERIALIZE
  const order = serializePrisma(orderRaw);

  const waMessage = buildPaymentConfirmationMessage({
    orderCode: order.orderCode ?? order.id.slice(0, 8),
    advertiserName: order.advertiserName ?? "Pengiklan",
    businessName: order.businessName ?? "-",
    slotPosition:
      AD_SLOT_CONFIG[order.slot.position]?.label ?? order.slot.position,
    totalPrice: order.totalPrice,
    startDate: order.startDate,
    endDate: order.endDate,
  });

  const waLink = buildWhatsAppLink(waMessage);

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-4">
      <div className="max-w-lg mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/40 mb-4">
            <svg
              className="w-7 h-7 text-green-600"
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Pesanan Berhasil Dibuat!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">
            Selesaikan pembayaran untuk mengaktifkan pesanan Anda
          </p>
        </div>

        {/* Detail Pesanan */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Kode Order
              </p>
              <p className="text-xl font-bold font-mono text-gray-900 dark:text-white tracking-wider">
                {order.orderCode ?? order.id.slice(0, 8)}
              </p>
            </div>
            <AdStatusBadge status={order.status} size="sm" />
          </div>

          <div className="space-y-2 text-sm border-t border-gray-100 dark:border-gray-700 pt-4">
            {[
              { label: "Pengiklan", value: order.advertiserName ?? "-" },
              { label: "Bisnis", value: order.businessName ?? "-" },
              {
                label: "Posisi Iklan",
                value:
                  AD_SLOT_CONFIG[order.slot.position]?.label ??
                  order.slot.position,
              },
              { label: "Ukuran Banner", value: order.slot.size },
              { label: "Mulai Tayang", value: formatDate(order.startDate) },
              { label: "Selesai", value: formatDate(order.endDate) },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">
                  {label}
                </span>
                <span className="font-medium text-gray-900 dark:text-white text-right">
                  {value}
                </span>
              </div>
            ))}

            <div className="flex justify-between pt-2 border-t border-gray-100 dark:border-gray-700 mt-2">
              <span className="font-semibold text-gray-900 dark:text-white">
                Total Bayar
              </span>
              <span className="font-bold text-lg text-blue-600 dark:text-blue-400">
                {formatRupiah(order.totalPrice)}
              </span>
            </div>
          </div>
        </div>

        {/* Instruksi Transfer */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-bold">
              1
            </span>
            Transfer ke Rekening Berikut
          </h2>

          <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 space-y-3">
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Bank</p>
              <p className="font-bold text-gray-900 dark:text-white">
                {PAYMENT_INFO.bankName}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Nomor Rekening</p>
              <div className="flex items-center gap-2">
                <p className="font-bold text-xl font-mono text-gray-900 dark:text-white tracking-wider">
                  {PAYMENT_INFO.accountNumber}
                </p>
                <CopyButton text={PAYMENT_INFO.accountNumber} />
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Atas Nama</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {PAYMENT_INFO.accountName}
              </p>
            </div>
          </div>

          <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <p className="text-xs text-amber-800 dark:text-amber-200">
              ⚠️ Transfer tepat nominal{" "}
              <strong>{formatRupiah(order.totalPrice)}</strong> dan
              cantumkan kode order{" "}
              <strong>{order.orderCode ?? order.id.slice(0, 8)}</strong> di
              berita transfer.
            </p>
          </div>
        </div>

        {/* Konfirmasi WA */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-bold">
              2
            </span>
            Konfirmasi via WhatsApp
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Setelah transfer, klik tombol di bawah untuk mengirim konfirmasi ke
            admin. Pesan sudah terisi otomatis.
          </p>

          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 w-full bg-[#25D366] hover:bg-[#1da851] text-white font-semibold py-3 px-6 rounded-xl transition-colors"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.558 4.118 1.535 5.845L.057 23.982l6.305-1.654A11.934 11.934 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.012-1.378l-.36-.214-3.733.979.998-3.648-.235-.374A9.818 9.818 0 1112 21.818z" />
            </svg>
            Konfirmasi Pembayaran via WhatsApp
          </a>
        </div>

        {/* Links */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href={`/cek-status/${order.orderCode ?? order.id}`}
            className="flex-1 text-center rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-2.5 px-4 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Cek Status Order
          </Link>
          <Link
            href="/pasang-iklan"
            className="flex-1 text-center rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-2.5 px-4 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Pesan Iklan Lain
          </Link>
        </div>

        <p className="text-center text-xs text-gray-500">
          Simpan kode order{" "}
          <strong>{order.orderCode ?? order.id.slice(0, 8)}</strong> untuk
          keperluan cek status
        </p>
      </div>
    </main>
  );
}