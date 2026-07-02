// src/app/api/ads/[id]/click/route.ts
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * Track click + redirect ke targetUrl.
 * Iklan di-click akan hit endpoint ini dulu, lalu redirect ke targetUrl asli.
 */
export async function GET(_request: Request, { params }: RouteContext) {
  const { id } = await params;

  try {
    const order = await prisma.adOrder.findUnique({
      where: { id },
      select: { targetUrl: true, status: true },
    });

    if (!order) {
      return NextResponse.redirect(new URL("/", process.env.NEXTAUTH_URL ?? "http://localhost:3000"));
    }

    if (!order.targetUrl) {
      return NextResponse.redirect(new URL("/", process.env.NEXTAUTH_URL ?? "http://localhost:3000"));
    }

    return NextResponse.redirect(order.targetUrl);
  } catch (error) {
    console.error("[AD_CLICK_ERROR]", error);
    return NextResponse.redirect(
      new URL("/", process.env.NEXTAUTH_URL ?? "http://localhost:3000")
    );
  }
}