// src/app/api/admin/articles/[id]/revision/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logActivity, ActivityAction } from "@/lib/activity-logger";

const bodySchema = z.object({
  note: z
    .string()
    .min(10, "Catatan revisi minimal 10 karakter")
    .max(1000, "Catatan maksimal 1000 karakter"),
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

    const existing = await prisma.article.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Artikel tidak ditemukan" },
        { status: 404 }
      );
    }

    if (existing.status !== "PENDING") {
      return NextResponse.json(
        { error: "Hanya artikel PENDING yang bisa diminta revisi" },
        { status: 400 }
      );
    }

    const article = await prisma.article.update({
      where: { id },
      data: {
        status: "REVISION",
        revisionNote: parsed.data.note,
      },
      select: { id: true, title: true },
    });

    await logActivity(
      session.user.id,
      ActivityAction.REQUEST_REVISION,
      article.id
    );

    return NextResponse.json({
      message: "Permintaan revisi terkirim",
      article,
    });
  } catch (error) {
    console.error("[ADMIN_REVISION_ERROR]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}