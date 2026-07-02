// src/app/cek-status/[orderCode]/page.tsx

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
import { AD_STATUS_LABELS, AD_SLOT_CONFIG } from "@/types/ad-order";
import type { AdOrderStatus } from "@/types/ad-order";
import { serializePrisma } from "@/lib/serialize";

interface Props {
  params: Promise<{ orderCode: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { orderCode } = await params;
  return {
    title: `Status Order ${orderCode} — Cipanas.com`,
    robots: "noindex",
  };
}

async function getOrderWithAutoExpire(orderCode: string) {
  const order = await prisma.adOrder.findUnique({
    where: { orderCode },
    include: { slot: true },
  });

  if (!order) return null;

  if (order.status === "ACTIVE" && order.endDate < new Date()) {
    const updated = await prisma.adOrder.update({
      where: { id: order.id },
      data: { status: "EXPIRED" },
      include: { slot: true },
    });
    return updated;
  }

  return order;
}

const STATUS_STEPS: AdOrderStatus[] = [
  "PENDING_PAYMENT",
  "AWAITING_CREATIVE",
  "PENDING_REVIEW",
  "ACTIVE",
];

function getStatusStep(status: AdOrderStatus): number {
  if (status === "EXPIRED" || status === "REJECTED") return -1;
  return STATUS_STEPS.indexOf(status);
}

export default async function CekStatusPage({ params }: Props) {
  const { orderCode } = await params;
  const orderRaw = await getOrderWithAutoExpire(orderCode);

  if (!orderRaw) notFound();

  // ⚠️ SERIALIZE
  const order = serializePrisma(orderRaw);

  const currentStep = getStatusStep(order.status);
  const isTerminal = order.status === "EXPIRED" || order.status === "REJECTED";

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

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-4">
      <div className="max-w-lg mx-auto space-y-6">
        {/* Header */}
        <div>
          <Link
            href="/pasang-iklan"
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 mb-4"
          >
            ← Pasang Iklan Baru
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Status Order Iklan
              </h1>
              <p className="font-mono text-lg font-semibold text-blue-600 dark:text-blue-400 mt-0.5">
                {order.orderCode ?? order.id.slice(0, 8)}
              </p>
            </div>
            <AdStatusBadge status={order.status} />
          </div>
        </div>

        {/* Progress Steps */}
        {!isTerminal && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="relative">
              <div className="absolute left-4 top-8 bottom-8 w-0.5 bg-gray-200 dark:bg-gray-700" />

              <ol className="space-y-6">
                {STATUS_STEPS.map((stepStatus, idx) => {
                  const isDone = idx < currentStep;
                  const isCurrent = idx === currentStep;

                  return (
                    <li key={stepStatus} className="relative flex gap-4">
                      <div
                        className={`
                          relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2
                          ${
                            isDone
                              ? "bg-green-500 border-green-500"
                              : isCurrent
                              ? "bg-blue-500 border-blue-500"
                              : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                          }
                        `}
                      >
                        {isDone ? (
                          <svg
                            className="w-4 h-4 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2.5}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        ) : (
                          <span
                            className={`text-xs font-bold ${
                              isCurrent ? "text-white" : "text-gray-400"
                            }`}
                          >
                            {idx + 1}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1 pb-1 pt-1">
                        <p
                          className={`text-sm font-medium ${
                            isCurrent
                              ? "text-blue-700 dark:text-blue-300"
                              : isDone
                              ? "text-gray-500 dark:text-gray-400 line-through"
                              : "text-gray-400 dark:text-gray-500"
                          }`}
                        >
                          {AD_STATUS_LABELS[stepStatus]}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        )}

        {/* Status Terminal */}
        {order.status === "REJECTED" && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-5">
            <h2 className="font-semibold text-red-800 dark:text-red-200 mb-2">
              ❌ Pesanan Ditolak
            </h2>
            {order.rejectionReason && (
              <p className="text-sm text-red-700 dark:text-red-300">
                <strong>Alasan:</strong> {order.rejectionReason}
              </p>
            )}
            <p className="text-sm text-red-600 dark:text-red-400 mt-2">
              Hubungi admin via WhatsApp untuk klarifikasi.
            </p>
          </div>
        )}

        {order.status === "EXPIRED" && (
          <div className="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5">
            <h2 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
              ⏰ Order Kadaluarsa
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Periode tayang iklan telah berakhir.
            </p>
          </div>
        )}

        {/* Aksi kontekstual */}
        {order.status === "PENDING_PAYMENT" && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-2xl p-5">
            <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium mb-3">
              💸 Segera lakukan pembayaran dan konfirmasi via WhatsApp
            </p>
            <a
              href={buildWhatsAppLink(waMessage)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1da851] text-white text-sm font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Konfirmasi Pembayaran
            </a>
          </div>
        )}

        {order.status === "AWAITING_CREATIVE" && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-5">
            <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">
              📤 Tunggu link upload materi dari admin via WhatsApp. Link akan
              dikirim dalam 1×24 jam setelah pembayaran dikonfirmasi.
            </p>
          </div>
        )}

        {order.status === "PENDING_REVIEW" && (
          <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-2xl p-5">
            <p className="text-sm text-purple-800 dark:text-purple-200 font-medium">
              🔍 Materi iklan Anda sedang direview admin. Proses maks. 1×24 jam.
            </p>
          </div>
        )}

        {/* Detail Order */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">
            Detail Pesanan
          </h2>
          <dl className="space-y-2 text-sm">
            {[
              { label: "Pengiklan", value: order.advertiserName ?? "-" },
              { label: "Bisnis", value: order.businessName ?? "-" },
              {
                label: "Posisi",
                value:
                  AD_SLOT_CONFIG[order.slot.position]?.label ??
                  order.slot.position,
              },
              { label: "Ukuran", value: order.slot.size },
              { label: "Mulai", value: formatDate(order.startDate) },
              { label: "Selesai", value: formatDate(order.endDate) },
              {
                label: "Total",
                value: formatRupiah(order.totalPrice),
                highlight: true,
              },
              {
                label: "Dipesan",
                value: formatDate(order.createdAt),
              },
            ].map(({ label, value, highlight }) => (
              <div key={label} className="flex justify-between">
                <dt className="text-gray-500 dark:text-gray-400">{label}</dt>
                <dd
                  className={`font-medium text-right ${
                    highlight
                      ? "text-blue-600 dark:text-blue-400 font-semibold"
                      : "text-gray-900 dark:text-white"
                  }`}
                >
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Preview Materi (jika sudah ada) */}
        {(order.imageUrl || order.mediaUrl) && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-3">
              Materi Iklan
            </h2>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={order.imageUrl ?? order.mediaUrl ?? ""}
              alt={order.altText ?? "Banner iklan"}
              className="w-full rounded-lg border border-gray-200 dark:border-gray-700 object-contain max-h-48"
            />
            {order.targetUrl && (
              <p className="mt-2 text-xs text-gray-500 truncate">
                🔗{" "}
                <a
                  href={order.targetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {order.targetUrl}
                </a>
              </p>
            )}
          </div>
        )}
      </div>
    </main>
  );
}