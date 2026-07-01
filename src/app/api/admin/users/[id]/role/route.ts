// src/app/api/admin/users/[id]/role/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logActivity, ActivityAction } from "@/lib/activity-logger";

const bodySchema = z.object({
  role: z.enum(["VISITOR", "CONTRIBUTOR", "ADMIN", "SUPER_ADMIN"]),
});

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * Ubah role user.
 * Hanya SUPER_ADMIN yang bisa promote ke ADMIN/SUPER_ADMIN.
 * ADMIN biasa hanya bisa ubah antara VISITOR ↔ CONTRIBUTOR.
 */
export async function PATCH(request: Request, { params }: RouteContext) {
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

    const { role: newRole } = parsed.data;

    // Cegah admin ubah role diri sendiri
    if (id === session.user.id) {
      return NextResponse.json(
        { error: "Tidak dapat mengubah role diri sendiri" },
        { status: 400 }
      );
    }

    const target = await prisma.user.findUnique({ where: { id } });
    if (!target) {
      return NextResponse.json(
        { error: "User tidak ditemukan" },
        { status: 404 }
      );
    }

    // ADMIN biasa (non SUPER_ADMIN) tidak boleh:
    // - Ubah role SUPER_ADMIN / ADMIN lain
    // - Promote user ke ADMIN atau SUPER_ADMIN
    if (session.user.role === "ADMIN") {
      if (target.role === "SUPER_ADMIN" || target.role === "ADMIN") {
        return NextResponse.json(
          {
            error:
              "Anda tidak dapat mengubah role admin lain. Hubungi Super Admin.",
          },
          { status: 403 }
        );
      }
      if (newRole === "ADMIN" || newRole === "SUPER_ADMIN") {
        return NextResponse.json(
          {
            error:
              "Hanya Super Admin yang dapat menaikkan role menjadi Admin.",
          },
          { status: 403 }
        );
      }
    }

    // Cegah menghapus SUPER_ADMIN terakhir
    if (target.role === "SUPER_ADMIN" && newRole !== "SUPER_ADMIN") {
      const count = await prisma.user.count({
        where: { role: "SUPER_ADMIN" },
      });
      if (count <= 1) {
        return NextResponse.json(
          {
            error:
              "Tidak dapat menurunkan Super Admin terakhir. Promosikan user lain dulu.",
          },
          { status: 400 }
        );
      }
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { role: newRole },
      select: { id: true, name: true, email: true, role: true },
    });

    await logActivity(
      session.user.id,
      ActivityAction.CHANGE_USER_ROLE,
      `${updated.id} (${updated.email}) → ${newRole}`
    );

    return NextResponse.json({
      message: "Role user diperbarui",
      user: updated,
    });
  } catch (error) {
    console.error("[USER_ROLE_UPDATE_ERROR]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}