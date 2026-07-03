import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

/**
 * Cron endpoint untuk expire iklan yang sudah lewat endDate.
 *
 * Akses:
 * 1. Vercel Cron / external cron → pakai header `Authorization: Bearer <CRON_SECRET>`
 * 2. Admin manual dari dashboard → pakai session NextAuth (ADMIN/SUPER_ADMIN)
 */
async function runExpireCron(): Promise<{
  success: true;
  expiredCount: number;
  timestamp: string;
}> {
  const now = new Date();

  const result = await prisma.adOrder.updateMany({
    where: {
      status: "ACTIVE",
      endDate: { lt: now },
    },
    data: {
      status: "EXPIRED",
    },
  });

  return {
    success: true,
    expiredCount: result.count,
    timestamp: now.toISOString(),
  };
}

/**
 * Authorization check — return true kalau boleh akses.
 */
async function isAuthorized(request: NextRequest): Promise<boolean> {
  // 1. Cek header Authorization (untuk Vercel Cron / external cron)
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (
    cronSecret &&
    authHeader === `Bearer ${cronSecret}`
  ) {
    return true;
  }

  // 2. Cek session admin (untuk trigger manual dari admin panel)
  const session = await getServerSession(authOptions);
  if (session?.user?.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true },
    });

    if (user && (user.role === "ADMIN" || user.role === "SUPER_ADMIN")) {
      return true;
    }
  }

  return false;
}

// GET — untuk Vercel Cron dan test manual di browser (kalau ada session admin)
export async function GET(request: NextRequest) {
  const authorized = await isAuthorized(request);
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await runExpireCron();
    return NextResponse.json(result);
  } catch (err) {
    console.error("Cron error:", err);
    return NextResponse.json(
      { error: "Internal server error", message: (err as Error).message },
      { status: 500 }
    );
  }
}

// POST — untuk trigger dari tombol admin panel
export async function POST(request: NextRequest) {
  const authorized = await isAuthorized(request);
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await runExpireCron();
    return NextResponse.json(result);
  } catch (err) {
    console.error("Cron error:", err);
    return NextResponse.json(
      { error: "Internal server error", message: (err as Error).message },
      { status: 500 }
    );
  }
}