// src/app/admin/iklan/[id]/page.tsx

import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { AdStatusBadge } from "@/components/ads/AdStatusBadge";
import { AdminAdActions } from "./AdminAdActions";
import { formatRupiah, formatDate } from "@/lib/ad-utils";
import { AD_SLOT_CONFIG } from "@/types/ad-order";
import { serializePrisma } from "@/lib/serialize";

interface Props {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "Detail Order Iklan — Admin Cipanas.com",
};

export default async function AdminIklanDetailPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/login");

  const adminUser = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (
    !adminUser ||
    (adminUser.role !== "ADMIN" && adminUser.role !== "SUPER_ADMIN")
  ) {
    redirect("/");
  }

  const { id } = await params;

  const orderRaw = await prisma.adOrder.findUnique({
    where: { id },
    include: {
      slot: true,
      paymentConfirmedBy: { select: { id: true, name: true, email: true } },
      reviewedBy: { select: { id: true, name: true, email: true } },
    },
  });

  if (!orderRaw) notFound();

  // ⚠️ SERIALIZE — convert semua Decimal → number sebelum render
  const order = serializePrisma(orderRaw);

  const displayCode = order.orderCode ?? order.id.slice(0, 8);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link
            href="/admin/iklan"
            className="hover:text-gray-700 dark:hover:text-gray-300"
          >
            Manajemen Iklan
          </Link>
          <span>/</span>
          <span className="font-mono text-gray-700 dark:text-gray-300">
            {displayCode}
          </span>
        </div>

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Detail Order Iklan
            </h1>
            <p className="font-mono text-lg font-semibold text-blue-600 dark:text-blue-400 mt-0.5">
              {displayCode}
            </p>
          </div>
          <AdStatusBadge status={order.status} />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Kiri: Info Order */}
          <div className="space-y-6">
            {/* Data Pengiklan */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="font-semibold text-gray-900 dark:text-white mb-4">
                Data Pengiklan
              </h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Nama</span>
                  <span className="font-medium text-gray-900 dark:text-white text-right">
                    {order.advertiserName ?? "-"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">
                    Bisnis
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white text-right">
                    {order.businessName ?? "-"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">
                    WhatsApp
                  </span>
                  <span className="font-medium text-right">
                    {order.whatsappNumber ? (
                      <a
                        href={`https://wa.me/${order.whatsappNumber}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:underline font-mono"
                      >
                        {order.whatsappNumber}
                      </a>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Detail Slot */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="font-semibold text-gray-900 dark:text-white mb-4">
                Detail Iklan
              </h2>
              <dl className="space-y-2 text-sm">
                {[
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
                    label: "Impresi",
                    value: order.impressionCount.toLocaleString("id-ID"),
                  },
                  {
                    label: "Klik",
                    value: order.clickCount.toLocaleString("id-ID"),
                  },
                  { label: "Dibuat", value: formatDate(order.createdAt) },
                ].map(({ label, value, highlight }) => (
                  <div key={label} className="flex justify-between">
                    <dt className="text-gray-500 dark:text-gray-400">
                      {label}
                    </dt>
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

            {/* Timeline Verifikasi */}
            {(order.paymentConfirmedAt ||
              order.creativeSubmittedAt ||
              order.reviewedAt) && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="font-semibold text-gray-900 dark:text-white mb-4">
                  Timeline
                </h2>
                <ol className="space-y-3 text-sm">
                  {order.paymentConfirmedAt && (
                    <li className="flex gap-3">
                      <span className="text-green-500 shrink-0">✓</span>
                      <div>
                        <p className="text-gray-900 dark:text-white">
                          Pembayaran diverifikasi
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(order.paymentConfirmedAt)} oleh{" "}
                          {order.paymentConfirmedBy?.name ?? "Admin"}
                        </p>
                      </div>
                    </li>
                  )}
                  {order.creativeSubmittedAt && (
                    <li className="flex gap-3">
                      <span className="text-blue-500 shrink-0">↑</span>
                      <div>
                        <p className="text-gray-900 dark:text-white">
                          Materi diupload pengiklan
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(order.creativeSubmittedAt)}
                        </p>
                      </div>
                    </li>
                  )}
                  {order.reviewedAt && (
                    <li className="flex gap-3">
                      <span
                        className={
                          order.status === "ACTIVE"
                            ? "text-green-500"
                            : "text-red-500"
                        }
                      >
                        {order.status === "ACTIVE" ? "✓" : "✕"}
                      </span>
                      <div>
                        <p className="text-gray-900 dark:text-white">
                          {order.status === "ACTIVE"
                            ? "Materi disetujui"
                            : "Materi ditolak"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(order.reviewedAt)} oleh{" "}
                          {order.reviewedBy?.name ?? "Admin"}
                        </p>
                        {order.rejectionReason && (
                          <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">
                            Alasan: {order.rejectionReason}
                          </p>
                        )}
                      </div>
                    </li>
                  )}
                </ol>
              </div>
            )}
          </div>

          {/* Kanan: Preview + Aksi */}
          <div className="space-y-6">
            {/* Preview Materi */}
            {(order.imageUrl || order.mediaUrl) && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="font-semibold text-gray-900 dark:text-white mb-3">
                  Preview Materi Iklan
                </h2>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={order.imageUrl ?? order.mediaUrl ?? ""}
                  alt={order.altText ?? "Banner iklan"}
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-700 object-contain max-h-48 bg-gray-100 dark:bg-gray-900"
                />
                {order.targetUrl && (
                  <div className="mt-3 p-2 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <p className="text-xs text-gray-500 mb-0.5">URL Tujuan:</p>
                    <a
                      href={order.targetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 dark:text-blue-400 hover:underline break-all"
                    >
                      {order.targetUrl}
                    </a>
                  </div>
                )}
                {order.altText && (
                  <p className="mt-2 text-xs text-gray-500">
                    Alt: {order.altText}
                  </p>
                )}
              </div>
            )}

            {/* Aksi Admin — pass primitive values saja */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="font-semibold text-gray-900 dark:text-white mb-4">
                Aksi Admin
              </h2>
              <AdminAdActions
                orderId={order.id}
                orderCode={displayCode}
                status={order.status}
                advertiserName={order.advertiserName}
                whatsappNumber={order.whatsappNumber}
                existingUploadToken={order.uploadToken}
                existingTokenExpiry={
                  order.uploadTokenExpiresAt
                    ? new Date(order.uploadTokenExpiresAt).toISOString()
                    : null
                }
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}