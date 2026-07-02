// src/app/api/cron/ads/route.ts
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

/**
 * Cron endpoint untuk update status iklan otomatis:
 * - Iklan ACTIVE yang endDate-nya sudah lewat → EXPIRED
 *
 * Cara pakai:
 * - Panggil GET/POST ke /api/cron/ads
 * - Optional: auth via header x-cron-secret (nilai dari CRON_SECRET di .env)
 * - Bisa dipanggil dari Vercel Cron, cron-job.org, atau GitHub Actions
 */

async function runCron() {
  const now = new Date();

  // Auto-expire iklan yang endDate-nya sudah lewat
  const expiredResult = await prisma.adOrder.updateMany({
    where: {
      status: "ACTIVE",
      endDate: { lt: now },
    },
    data: { status: "EXPIRED" },
  });

  const activeCount = await prisma.adOrder.count({
    where: { status: "ACTIVE" },
  });

  return {
    expired: expiredResult.count,
    stillActive: activeCount,
    checkedAt: now.toISOString(),
  };
}

function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    // Kalau CRON_SECRET tidak diset, allow all di dev
    return process.env.NODE_ENV === "development";
  }
  const header = request.headers.get("x-cron-secret");
  return header === secret;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const result = await runCron();
    return NextResponse.json({
      message: "Cron executed successfully",
      ...result,
    });
  } catch (error) {
    console.error("[CRON_ADS_ERROR]", error);
    return NextResponse.json(
      {
        error: "Cron execution failed",
        detail: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  return GET(request);
}