// src/app/api/admin/ads/[id]/reject/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logActivity, ActivityAction } from "@/lib/activity-logger";

const bodySchema = z.object({
  reason: z
    .string()
    .min(10, "Alasan minimal 10 karakter")
    .max(500, "Alasan maksimal 500 karakter"),
});

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, { params }: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Data tidak valid",
          issues: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const existing = await prisma.adOrder.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Order tidak ditemukan" },
        { status: 404 }
      );
    }

    if (existing.status !== "PENDING_REVIEW") {
      return NextResponse.json(
        { error: "Hanya order PENDING_REVIEW yang bisa ditolak" },
        { status: 400 }
      );
    }

    const order = await prisma.adOrder.update({
      where: { id },
      data: { status: "REJECTED" },
      select: { id: true, advertiserName: true },
    });

    await logActivity(
      session.user.id,
      ActivityAction.REJECT_AD,
      `${order.id} (${order.advertiserName}) - ${parsed.data.reason}`
    );

    return NextResponse.json({
      message: "Iklan ditolak",
      order,
    });
  } catch (error) {
    console.error("[AD_REJECT_ERROR]", error);
    return NextResponse.json(
      {
        error: "Server error",
        detail: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}