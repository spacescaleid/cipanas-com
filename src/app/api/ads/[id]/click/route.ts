// src/app/api/ads/[id]/click/route.ts

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { incrementAdClick } from "@/lib/ad-queries";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * Tracking klik + redirect ke targetUrl iklan.
 * Increment clickCount tapi jangan sampai gagal memblokir redirect.
 */
export async function GET(_request: Request, { params }: RouteContext) {
  const { id } = await params;

  // Ambil targetUrl dulu (WAJIB — redirect tergantung ini)
  const order = await prisma.adOrder.findUnique({
    where: { id },
    select: { targetUrl: true, status: true },
  });

  if (!order || !order.targetUrl) {
    return NextResponse.json(
      { error: "Ad not found or has no target URL" },
      { status: 404 }
    );
  }

  // Increment click (fire-and-forget, jangan blokir redirect)
  try {
    await incrementAdClick(id);
  } catch (err) {
    console.error(`Failed to increment click for ad ${id}:`, err);
  }

  // Redirect ke target URL
  return NextResponse.redirect(order.targetUrl, { status: 302 });
}