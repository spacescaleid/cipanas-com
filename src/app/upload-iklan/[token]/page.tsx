// src/app/upload-iklan/[token]/page.tsx

import type { Metadata } from "next";
import prisma from "@/lib/prisma";
import { AdStatusBadge } from "@/components/ads/AdStatusBadge";
import { formatDate } from "@/lib/ad-utils";
import { AD_SLOT_CONFIG } from "@/types/ad-order";
import { UploadForm } from "./UploadForm";
import { serializePrisma } from "@/lib/serialize";

interface Props {
  params: Promise<{ token: string }>;
}

export const metadata: Metadata = {
  title: "Upload Materi Iklan — Cipanas.com",
  robots: "noindex",
};

export default async function UploadIklanPage({ params }: Props) {
  const { token } = await params;

  const orderRaw = await prisma.adOrder.findUnique({
    where: { uploadToken: token },
    include: {
      slot: {
        select: {
          id: true,
          position: true,
          size: true,
          label: true,
          pricePerDay: true,
          isActive: true,
        },
      },
    },
  });

  if (!orderRaw) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 text-center">
          <div className="text-4xl mb-4">🔗</div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Link Tidak Valid
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Link upload yang Anda gunakan tidak ditemukan. Pastikan Anda membuka
            link yang dikirimkan admin via WhatsApp.
          </p>
        </div>
      </main>
    );
  }

  // Serialize dulu
  const order = serializePrisma(orderRaw);

  // DEBUG (hapus setelah verify)
  console.log("=== DEBUG ORDER TYPES ===");
  console.log("totalPrice:", typeof order.totalPrice, order.totalPrice);
  console.log("slot.pricePerDay:", typeof order.slot.pricePerDay, order.slot.pricePerDay);
  console.log("=========================");

  const isTokenExpired =
    !order.uploadTokenExpiresAt ||
    new Date(order.uploadTokenExpiresAt) < new Date();

  if (isTokenExpired) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 text-center">
          <div className="text-4xl mb-4">⏰</div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Link Upload Kedaluwarsa
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Link upload Anda sudah tidak berlaku sejak{" "}
            {order.uploadTokenExpiresAt
              ? formatDate(order.uploadTokenExpiresAt)
              : "beberapa waktu lalu"}
            . Hubungi admin untuk mendapatkan link baru.
          </p>
          <p className="mt-4 text-xs text-gray-400">
            Kode Order:{" "}
            <strong className="font-mono">
              {order.orderCode ?? order.id.slice(0, 8)}
            </strong>
          </p>
        </div>
      </main>
    );
  }

  const uploadableStatuses = ["AWAITING_CREATIVE", "REJECTED"];
  if (!uploadableStatuses.includes(order.status)) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 text-center">
          <AdStatusBadge status={order.status} />
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mt-4 mb-2">
            Upload Tidak Diperlukan
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            {order.status === "PENDING_REVIEW"
              ? "Materi iklan Anda sudah diterima dan sedang direview admin."
              : order.status === "ACTIVE"
              ? "Iklan Anda sudah aktif tayang!"
              : "Status order saat ini tidak memerlukan upload materi."}
          </p>
          <p className="mt-4 text-xs text-gray-400">
            Kode Order:{" "}
            <strong className="font-mono">
              {order.orderCode ?? order.id.slice(0, 8)}
            </strong>
          </p>
        </div>
      </main>
    );
  }

  // 🔑 KUNCI: Build orderForClient dengan hanya field yang dibutuhkan UploadForm
  // Semua field bertipe primitive (string, number, Date, null) — no Decimal!
  const orderForClient = {
    id: order.id,
    orderCode: order.orderCode,
    status: order.status,
    startDate: order.startDate,
    endDate: order.endDate,
    rejectionReason: order.rejectionReason,
    uploadTokenExpiresAt: order.uploadTokenExpiresAt,
    imageUrl: order.imageUrl,
    targetUrl: order.targetUrl,
    altText: order.altText,
    totalPrice: Number(order.totalPrice), // ← FORCE convert
    slot: {
      id: order.slot.id,
      position: order.slot.position,
      size: order.slot.size,
      label: order.slot.label,
      pricePerDay: Number(order.slot.pricePerDay), // ← FORCE convert
      isActive: order.slot.isActive,
    },
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-4">
      <div className="max-w-lg mx-auto">
        <div className="mb-8">
          <span className="inline-block bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-semibold px-3 py-1 rounded-full mb-3">
            Upload Materi Iklan
          </span>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            Upload Banner Iklan
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Kode Order:{" "}
            <span className="font-mono font-semibold text-gray-900 dark:text-white">
              {order.orderCode ?? order.id.slice(0, 8)}
            </span>
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
              Detail Slot Iklan
            </h2>
            <AdStatusBadge status={order.status} size="sm" />
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-gray-500 text-xs">Posisi</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {AD_SLOT_CONFIG[order.slot.position]?.label ??
                  order.slot.label ??
                  order.slot.position}
              </p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Ukuran</p>
              <p className="font-medium font-mono text-gray-900 dark:text-white">
                {order.slot.size}
              </p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Mulai Tayang</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {formatDate(order.startDate)}
              </p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Link berlaku hingga</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {order.uploadTokenExpiresAt
                  ? formatDate(order.uploadTokenExpiresAt)
                  : "-"}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <UploadForm order={orderForClient} token={token} />
        </div>
      </div>
    </main>
  );
}