// src/app/api/admin/ads/[id]/approve/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logActivity, ActivityAction } from "@/lib/activity-logger";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: Request, { params }: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const existing = await prisma.adOrder.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Order tidak ditemukan" },
        { status: 404 }
      );
    }

    if (existing.status !== "PENDING_APPROVAL") {
      return NextResponse.json(
        { error: "Hanya order PENDING_APPROVAL yang bisa disetujui" },
        { status: 400 }
      );
    }

    const now = new Date();
    const shouldAdjustStart = existing.startDate < now;

    const order = await prisma.adOrder.update({
      where: { id },
      data: {
        status: "ACTIVE",
        ...(shouldAdjustStart ? { startDate: now } : {}),
      },
      select: { id: true, advertiserName: true },
    });

    await logActivity(
      session.user.id,
      ActivityAction.APPROVE_AD,
      `${order.id} (${order.advertiserName})`
    );

    return NextResponse.json({
      message: "Iklan disetujui dan sekarang aktif",
      order,
    });
  } catch (error) {
    console.error("[AD_APPROVE_ERROR]", error);
    return NextResponse.json(
      {
        error: "Server error",
        detail: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}