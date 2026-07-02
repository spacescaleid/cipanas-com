import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  // Optional: verify cron secret untuk security
  const authHeader = request.headers.get("authorization");
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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

  return NextResponse.json({
    success: true,
    expiredCount: result.count,
    timestamp: now.toISOString(),
  });
}