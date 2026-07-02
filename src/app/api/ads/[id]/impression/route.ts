// src/app/api/ads/[id]/impression/route.ts
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * Record impression untuk iklan.
 * Dipanggil fire-and-forget dari client saat iklan terlihat di viewport.
 */
export async function POST(_request: Request, { params }: RouteContext) {
  const { id } = await params;

  try {
    return NextResponse.json({ ok: true });
  } catch {
    // Ignore error — impression tracking tidak boleh block user
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}