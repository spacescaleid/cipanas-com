// src/app/pasang-iklan/page.tsx

import type { Metadata } from "next";
import prisma from "@/lib/prisma";
import { OrderForm } from "@/components/ads/OrderForm";
import { AD_SLOT_CONFIG } from "@/types/ad-order";
import { formatRupiah } from "@/lib/ad-utils";
import { serializePrisma } from "@/lib/serialize";

export const metadata: Metadata = {
  title: "Pasang Iklan — Cipanas.com",
  description:
    "Jangkau ribuan pembaca Cipanas.com setiap harinya. Pasang iklan bisnis Anda sekarang.",
};

export const revalidate = 3600;

export default async function PasangIklanPage() {
  const slotsRaw = await prisma.adSlot.findMany({
    where: { isActive: true },
    orderBy: { pricePerDay: "asc" },
  });

  // ⚠️ SERIALIZE — Decimal → number
  const slots = serializePrisma(slotsRaw);

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <span className="inline-block bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-semibold px-3 py-1 rounded-full mb-3">
            Iklan Cipanas.com
          </span>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
            Pasang Iklan di Cipanas.com
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            Jangkau pembaca lokal Cipanas dan sekitarnya. Proses pemesanan
            mudah, pembayaran via transfer, iklan tayang sesuai jadwal.
          </p>
        </div>

        {/* Keunggulan */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { icon: "👥", label: "Pembaca Lokal", value: "10K+/bulan" },
            { icon: "⚡", label: "Proses Cepat", value: "< 24 jam" },
            { icon: "💬", label: "Koordinasi", value: "via WhatsApp" },
          ].map((item) => (
            <div
              key={item.label}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center"
            >
              <div className="text-2xl mb-1">{item.icon}</div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {item.value}
              </div>
              <div className="text-xs text-gray-500">{item.label}</div>
            </div>
          ))}
        </div>

        {/* Tabel Harga */}
        {slots.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 mb-8">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
              Daftar Harga Slot Iklan
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left pb-2 text-gray-600 dark:text-gray-400 font-medium">
                      Posisi
                    </th>
                    <th className="text-left pb-2 text-gray-600 dark:text-gray-400 font-medium">
                      Ukuran
                    </th>
                    <th className="text-right pb-2 text-gray-600 dark:text-gray-400 font-medium">
                      Harga/Hari
                    </th>
                    <th className="text-right pb-2 text-gray-600 dark:text-gray-400 font-medium">
                      30 Hari
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {slots.map((slot) => (
                    <tr
                      key={slot.id}
                      className="border-b border-gray-100 dark:border-gray-800 last:border-0"
                    >
                      <td className="py-2.5 text-gray-900 dark:text-white font-medium">
                        {AD_SLOT_CONFIG[slot.position]?.label ?? slot.position}
                      </td>
                      <td className="py-2.5 text-gray-500 font-mono text-xs">
                        {slot.size}
                      </td>
                      <td className="py-2.5 text-right text-gray-900 dark:text-white">
                        {formatRupiah(slot.pricePerDay)}
                      </td>
                      <td className="py-2.5 text-right text-green-700 dark:text-green-400 font-semibold">
                        {formatRupiah(slot.pricePerDay * 30)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Form Pemesanan */}
        {slots.length > 0 ? (
          <OrderForm slots={slots} />
        ) : (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-2xl p-8 text-center">
            <p className="text-yellow-800 dark:text-yellow-200 font-medium">
              Slot iklan sedang tidak tersedia
            </p>
            <p className="text-yellow-600 dark:text-yellow-400 text-sm mt-1">
              Hubungi kami via WhatsApp untuk informasi lebih lanjut
            </p>
          </div>
        )}

        {/* Alur Singkat */}
        <div className="mt-10 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
            Cara Pasang Iklan
          </h2>
          <ol className="space-y-3">
            {[
              "Isi form pemesanan di atas",
              "Transfer sesuai nominal yang tertera",
              "Konfirmasi pembayaran via WhatsApp (link otomatis tersedia)",
              "Upload banner iklan Anda setelah pembayaran dikonfirmasi",
              "Iklan live setelah review admin (maks. 1×24 jam)",
            ].map((step, i) => (
              <li
                key={i}
                className="flex gap-3 text-sm text-gray-600 dark:text-gray-400"
              >
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </main>
  );
}