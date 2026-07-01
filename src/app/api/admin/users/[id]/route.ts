// src/app/api/admin/users/[id]/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logActivity, ActivityAction } from "@/lib/activity-logger";

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * Hapus user beserta semua artikelnya (cascade via schema).
 * Hanya SUPER_ADMIN yang boleh.
 */
export async function DELETE(_request: Request, { params }: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json(
      { error: "Hanya Super Admin yang dapat menghapus user" },
      { status: 403 }
    );
  }

  const { id } = await params;

  try {
    // Cegah hapus diri sendiri
    if (id === session.user.id) {
      return NextResponse.json(
        { error: "Tidak dapat menghapus akun sendiri" },
        { status: 400 }
      );
    }

    const target = await prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, role: true },
    });
    if (!target) {
      return NextResponse.json(
        { error: "User tidak ditemukan" },
        { status: 404 }
      );
    }

    // Cegah hapus SUPER_ADMIN terakhir
    if (target.role === "SUPER_ADMIN") {
      const count = await prisma.user.count({
        where: { role: "SUPER_ADMIN" },
      });
      if (count <= 1) {
        return NextResponse.json(
          { error: "Tidak dapat menghapus Super Admin terakhir" },
          { status: 400 }
        );
      }
    }

    await prisma.user.delete({ where: { id } });

    await logActivity(
      session.user.id,
      ActivityAction.DELETE_USER,
      `${target.id} (${target.email})`
    );

    return NextResponse.json({ message: "User dihapus" });
  } catch (error) {
    console.error("[USER_DELETE_ERROR]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}