// src/app/api/admin/articles/[id]/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logActivity, ActivityAction } from "@/lib/activity-logger";

type RouteContext = {
  params: Promise<{ id: string }>;
};

/** Admin bisa hapus artikel apapun (kecuali PUBLISHED langsung — lebih aman diturunkan dulu) */
export async function DELETE(_request: Request, { params }: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const existing = await prisma.article.findUnique({
      where: { id },
      select: { id: true, title: true, status: true },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Artikel tidak ditemukan" },
        { status: 404 }
      );
    }

    await prisma.article.delete({ where: { id } });

    await logActivity(
      session.user.id,
      ActivityAction.DELETE_ARTICLE,
      `${existing.id} (${existing.title})`
    );

    return NextResponse.json({ message: "Artikel dihapus permanen" });
  } catch (error) {
    console.error("[ADMIN_DELETE_ARTICLE_ERROR]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}