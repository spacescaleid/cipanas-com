// src/app/admin/iklan/[id]/page.tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  ExternalLink,
  Calendar,
  Mail,
  User as UserIcon,
} from "lucide-react";

import { requireRole } from "@/lib/auth-utils";
import { getAdOrderById } from "@/lib/ad-queries";
import { AdOrderStatusBadge } from "@/components/admin/AdOrderStatusBadge";
import { AdApprovalActions } from "@/components/admin/AdApprovalActions";
import { formatDate, formatRupiah, formatDateTime } from "@/lib/format";

export default async function AdminIklanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(["ADMIN", "SUPER_ADMIN"]);
  const { id } = await params;

  const order = await getAdOrderById(id);
  if (!order) notFound();

  const duration = Math.ceil(
    (order.endDate.getTime() - order.startDate.getTime()) /
      (24 * 60 * 60 * 1000)
  );

  return (
    <div>
      <Link
        href="/admin/iklan"
        className="mb-4 inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-brand-600 dark:text-neutral-400"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke daftar iklan
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex flex-wrap items-center gap-2">
              <AdOrderStatusBadge status={order.status} />
              <span className="text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                {order.slot.position}
              </span>
              <span className="font-mono text-xs text-neutral-500">
                {order.slot.size}
              </span>
            </div>

            <h1 className="mt-3 font-serif text-3xl font-bold leading-tight text-neutral-900 dark:text-white">
              {order.advertiserName}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-4 border-y border-neutral-200 py-3 text-xs text-neutral-600 dark:border-neutral-800 dark:text-neutral-400">
              <span className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" />
                {order.email}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                {formatDate(order.startDate)} – {formatDate(order.endDate)} (
                {duration} hari)
              </span>
            </div>

            <div className="mt-6">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Preview Materi Iklan
              </h3>
              <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-6 dark:border-neutral-800 dark:bg-neutral-900">
                <Image
                  src={order.mediaUrl}
                  alt={order.advertiserName}
                  width={800}
                  height={400}
                  className="mx-auto max-h-80 w-auto rounded"
                  unoptimized
                />
              </div>
              <p className="mt-2 text-xs text-neutral-500">
                Ukuran materi:{" "}
                <span className="font-mono">{order.slot.size}</span> · Klik akan
                mengarahkan ke:
              </p>
              <a
                href={order.targetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-flex items-center gap-1 break-all text-sm text-brand-600 hover:underline"
              >
                {order.targetUrl}
                <ExternalLink className="h-3 w-3 shrink-0" />
              </a>
            </div>
          </div>

          {order.payments.length > 0 && (
            <div className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
              <h3 className="mb-4 font-serif text-lg font-bold text-neutral-900 dark:text-white">
                Riwayat Pembayaran
              </h3>
              <div className="space-y-3">
                {order.payments.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between rounded-lg border border-neutral-200 p-3 text-sm dark:border-neutral-800"
                  >
                    <div>
                      <div className="font-semibold text-neutral-900 dark:text-white">
                        {formatRupiah(Number(p.amount))}
                      </div>
                      <div className="mt-0.5 text-xs text-neutral-500">
                        {p.method.replace(/_/g, " ").toUpperCase()} ·{" "}
                        {formatDateTime(p.createdAt)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="inline-block rounded bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700 dark:bg-green-900/40 dark:text-green-300">
                        {p.gatewayStatus}
                      </div>
                      <div className="mt-0.5 font-mono text-[10px] text-neutral-500">
                        {p.paymentRef}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="lg:sticky lg:top-24 space-y-6">
            <AdApprovalActions
              orderId={order.id}
              orderStatus={order.status}
            />

            <div className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Ringkasan Order
              </h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-neutral-500">Order ID</dt>
                  <dd className="font-mono text-xs text-neutral-900 dark:text-white">
                    {order.id.substring(0, 12)}…
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-neutral-500">Total</dt>
                  <dd className="font-semibold text-brand-700 dark:text-brand-400">
                    {formatRupiah(Number(order.totalPrice))}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-neutral-500">Dibuat</dt>
                  <dd className="text-neutral-900 dark:text-white">
                    {formatDate(order.createdAt)}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Info Pengiklan
              </h3>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-900/40">
                  <UserIcon className="h-5 w-5 text-brand-600 dark:text-brand-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold text-neutral-900 dark:text-white">
                    {order.advertiserName}
                  </div>
                  <div className="truncate text-xs text-neutral-500">
                    {order.email}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}