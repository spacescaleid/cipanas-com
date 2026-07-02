// src/app/api/ads/[id]/impression/route.ts

import { NextResponse } from "next/server";
import { incrementAdImpression } from "@/lib/ad-queries";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * Endpoint fire-and-forget untuk tracking impression iklan.
 * Dipanggil dari AdRotator.tsx via IntersectionObserver saat iklan
 * benar-benar terlihat di viewport (≥50%).
 *
 * Selalu return { ok: true } — kalau increment gagal, kita log tapi
 * jangan sampai bikin client dapat error (fire-and-forget pattern).
 */
export async function POST(_request: Request, { params }: RouteContext) {
  const { id } = await params;

  try {
    await incrementAdImpression(id);
  } catch (err) {
    // Fire-and-forget: log error tapi jangan expose ke client
    console.error(`Failed to increment impression for ad ${id}:`, err);
  }

  return NextResponse.json({ ok: true });
}