// src/app/admin/iklan/page.tsx

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { AdStatusBadge } from "@/components/ads/AdStatusBadge";
import { formatRupiah, formatDate } from "@/lib/ad-utils";
import { AD_STATUS_LABELS } from "@/types/ad-order";
import type { AdOrderStatus } from "@/types/ad-order";
import { serializePrisma } from "@/lib/serialize";

export const metadata: Metadata = {
  title: "Manajemen Iklan — Admin Cipanas.com",
};

interface Props {
  searchParams: Promise<{ status?: string }>;
}

const ALL_STATUSES: AdOrderStatus[] = [
  "PENDING_PAYMENT",
  "AWAITING_CREATIVE",
  "PENDING_REVIEW",
  "ACTIVE",
  "REJECTED",
  "EXPIRED",
];

export default async function AdminIklanPage({ searchParams }: Props) {
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

  const { status: statusFilter } = await searchParams;
  const activeFilter = statusFilter ?? "ALL";

  const where =
    activeFilter !== "ALL" && ALL_STATUSES.includes(activeFilter as AdOrderStatus)
      ? { status: activeFilter as AdOrderStatus }
      : {};

  const [ordersRaw, counts] = await Promise.all([
    prisma.adOrder.findMany({
      where,
      include: { slot: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.adOrder.groupBy({
      by: ["status"],
      _count: { status: true },
    }),
  ]);

  // ⚠️ SERIALIZE semua Decimal → number
  const orders = serializePrisma(ordersRaw);

  const countMap = counts.reduce(
    (acc, { status, _count }) => {
      acc[status] = _count.status;
      return acc;
    },
    {} as Record<string, number>
  );

  const totalCount = Object.values(countMap).reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Manajemen Iklan
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">
              {totalCount} total order iklan
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Link
            href="/admin/iklan"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeFilter === "ALL"
                ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-50"
            }`}
          >
            Semua ({totalCount})
          </Link>
          {ALL_STATUSES.map((status) => (
            <Link
              key={status}
              href={`/admin/iklan?status=${status}`}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeFilter === status
                  ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                  : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-50"
              }`}
            >
              {AD_STATUS_LABELS[status]}
              {countMap[status] ? (
                <span
                  className={`ml-1.5 inline-flex items-center justify-center h-5 min-w-5 px-1 rounded-full text-xs font-bold ${
                    activeFilter === status
                      ? "bg-white/20 text-white"
                      : status === "PENDING_PAYMENT" ||
                        status === "PENDING_REVIEW"
                      ? "bg-red-100 text-red-700"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                  }`}
                >
                  {countMap[status]}
                </span>
              ) : null}
            </Link>
          ))}
        </div>

        {/* Tabel */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {orders.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              Tidak ada order dengan filter ini
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    {[
                      "Kode Order",
                      "Pengiklan",
                      "Posisi",
                      "Periode",
                      "Total",
                      "Status",
                      "Dibuat",
                      "Aksi",
                    ].map((h) => (
                      <th
                        key={h}
                        className="text-left px-4 py-3 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                  {orders.map((order) => (
                    <tr
                      key={order.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs font-semibold text-gray-900 dark:text-white">
                          {order.orderCode ?? order.id.slice(0, 8)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {order.advertiserName ?? "-"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {order.businessName ?? "-"}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-gray-900 dark:text-white">
                          {order.slot.position}
                        </p>
                        <p className="text-xs font-mono text-gray-500">
                          {order.slot.size}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400">
                        <p>{formatDate(order.startDate)}</p>
                        <p>s/d {formatDate(order.endDate)}</p>
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">
                        {formatRupiah(order.totalPrice)}
                      </td>
                      <td className="px-4 py-3">
                        <AdStatusBadge status={order.status} size="sm" />
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/iklan/${order.id}`}
                          className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline text-xs font-medium"
                        >
                          Detail →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}