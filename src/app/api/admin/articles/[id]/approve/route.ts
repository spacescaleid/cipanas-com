// src/app/api/admin/articles/[id]/approve/route.ts
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
    const existing = await prisma.article.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Artikel tidak ditemukan" },
        { status: 404 }
      );
    }

    // Hanya PENDING yang bisa di-approve
    if (existing.status !== "PENDING") {
      return NextResponse.json(
        { error: "Hanya artikel dengan status PENDING yang bisa dipublikasikan" },
        { status: 400 }
      );
    }

    const article = await prisma.article.update({
      where: { id },
      data: {
        status: "PUBLISHED",
        publishedAt: new Date(),
        revisionNote: null,
      },
      select: { id: true, title: true },
    });

    await logActivity(
      session.user.id,
      ActivityAction.APPROVE_ARTICLE,
      article.id
    );

    return NextResponse.json({
      message: "Artikel berhasil dipublikasikan",
      article,
    });
  } catch (error) {
    console.error("[ADMIN_APPROVE_ERROR]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}