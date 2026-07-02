// src/app/admin/iklan/page.tsx
import type { AdOrderStatus } from "@prisma/client";

import { requireRole } from "@/lib/auth-utils";
import { getAdminAdOrders, getAdOrderCounts } from "@/lib/ad-queries";
import { AdOrderFilterBar } from "@/components/admin/AdOrderFilterBar";
import { AdOrderList } from "@/components/admin/AdOrderList";

type FilterKey =
  | "ALL"
  | "PENDING_PAYMENT"
  | "PENDING_APPROVAL"
  | "ACTIVE"
  | "EXPIRED"
  | "REJECTED";

const VALID: FilterKey[] = [
  "ALL",
  "PENDING_PAYMENT",
  "PENDING_APPROVAL",
  "ACTIVE",
  "EXPIRED",
  "REJECTED",
];

function parseFilter(raw?: string): FilterKey {
  if (!raw) return "PENDING_APPROVAL";
  const upper = raw.toUpperCase() as FilterKey;
  return VALID.includes(upper) ? upper : "PENDING_APPROVAL";
}

export default async function AdminIklanPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireRole(["ADMIN", "SUPER_ADMIN"]);
  const sp = await searchParams;
  const filter = parseFilter(sp.status);

  const [orders, counts] = await Promise.all([
    getAdminAdOrders(
      filter === "ALL" ? undefined : (filter as AdOrderStatus)
    ),
    getAdOrderCounts(),
  ]);

  const serialized = orders.map((o) => ({
    id: o.id,
    advertiserName: o.advertiserName,
    email: o.email,
    mediaUrl: o.mediaUrl,
    targetUrl: o.targetUrl,
    startDate: o.startDate,
    endDate: o.endDate,
    status: o.status,
    totalPrice: Number(o.totalPrice),
    slot: {
      position: o.slot.position,
      size: o.slot.size,
    },
  }));

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-3xl font-bold text-neutral-900 dark:text-white">
          Kelola Iklan
        </h1>
        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
          Setujui, tolak, atau pantau iklan yang tayang di Cipanas.com.
        </p>
      </div>

      <AdOrderFilterBar current={filter} counts={counts} />

      <div className="mt-6">
        <AdOrderList orders={serialized} />
      </div>
    </div>
  );
}