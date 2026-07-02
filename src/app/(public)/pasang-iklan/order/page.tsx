// src/app/(public)/pasang-iklan/order/page.tsx
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";

import { getAdSlotById } from "@/lib/ad-queries";
import { AdOrderForm } from "@/components/ads/AdOrderForm";

export const metadata: Metadata = {
  title: "Pesan Iklan — Cipanas.com",
};

export default async function OrderIklanPage({
  searchParams,
}: {
  searchParams: Promise<{ slot?: string }>;
}) {
  const sp = await searchParams;
  if (!sp.slot) redirect("/pasang-iklan");

  const slot = await getAdSlotById(sp.slot);
  if (!slot) notFound();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <AdOrderForm
        slot={{
          id: slot.id,
          position: slot.position,
          size: slot.size,
          pricePerDay: Number(slot.pricePerDay),
        }}
      />
    </div>
  );
}