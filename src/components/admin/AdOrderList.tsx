// src/components/admin/AdOrderList.tsx
import Link from "next/link";
import Image from "next/image";
import { Calendar, Mail } from "lucide-react";
import type { AdOrderStatus, AdPosition } from "@prisma/client";

import { AdOrderStatusBadge } from "./AdOrderStatusBadge";
import { formatDate, formatRupiah } from "@/lib/format";

interface AdOrderItem {
  id: string;
  advertiserName: string;
  email: string;
  mediaUrl: string;
  targetUrl: string;
  startDate: Date;
  endDate: Date;
  status: AdOrderStatus;
  totalPrice: number;
  impressionCount: number;
  clickCount: number;
  slot: {
    position: AdPosition;
    size: string;
  };
}

interface Props {
  orders: AdOrderItem[];
}

export function AdOrderList({ orders }: Props) {
  if (orders.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-neutral-300 py-16 text-center dark:border-neutral-700">
        <p className="text-neutral-600 dark:text-neutral-400">
          Tidak ada iklan dengan status ini.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => (
        <Link
          key={order.id}
          href={`/admin/iklan/${order.id}`}
          className="flex gap-4 rounded-xl border border-neutral-200 bg-white p-4 transition hover:shadow-card dark:border-neutral-800 dark:bg-neutral-900"
        >
          <div className="relative h-24 w-32 shrink-0 overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-800 sm:h-28 sm:w-40">
            <Image
              src={order.mediaUrl}
              alt={order.advertiserName}
              fill
              sizes="160px"
              className="object-contain p-2"
              unoptimized
            />
          </div>

          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex flex-wrap items-center gap-2">
              <AdOrderStatusBadge status={order.status} />
              <span className="text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                {order.slot.position}
              </span>
              <span className="font-mono text-xs text-neutral-500">
                {order.slot.size}
              </span>
            </div>

            <h3 className="mt-1.5 font-serif text-base font-bold text-neutral-900 dark:text-white sm:text-lg">
              {order.advertiserName}
            </h3>

            <div className="mt-1 flex items-center gap-1.5 text-xs text-neutral-500">
              <Mail className="h-3 w-3" />
              {order.email}
            </div>

            <div className="mt-auto flex flex-wrap items-center gap-3 pt-2 text-xs text-neutral-500">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDate(order.startDate)} – {formatDate(order.endDate)}
              </span>
              <span>•</span>
              <span className="font-semibold text-neutral-900 dark:text-white">
                {formatRupiah(Number(order.totalPrice))}
              </span>
              {order.status === "ACTIVE" && (
                <>
                  <span>•</span>
                  <span>👁 {order.impressionCount.toLocaleString("id-ID")}</span>
                  <span>🖱 {order.clickCount.toLocaleString("id-ID")}</span>
                </>
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}