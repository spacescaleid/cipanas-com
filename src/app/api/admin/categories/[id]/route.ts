// src/app/api/admin/categories/[id]/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import slugify from "slugify";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { categorySchema } from "@/lib/category-schema";
import { logActivity, ActivityAction } from "@/lib/activity-logger";

type RouteContext = {
  params: Promise<{ id: string }>;
};

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
    const parsed = categorySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Data tidak valid",
          issues: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Kategori tidak ditemukan" },
        { status: 404 }
      );
    }

    const { name } = parsed.data;

    // Cek nama duplikat (kecuali diri sendiri)
    if (name !== existing.name) {
      const dup = await prisma.category.findUnique({ where: { name } });
      if (dup) {
        return NextResponse.json(
          { error: "Kategori dengan nama tersebut sudah ada" },
          { status: 409 }
        );
      }
    }

    const slug =
      name !== existing.name
        ? slugify(name, { lower: true, strict: true, locale: "id" })
        : existing.slug;

    const category = await prisma.category.update({
      where: { id },
      data: { name, slug },
    });

    await logActivity(
      session.user.id,
      ActivityAction.UPDATE_CATEGORY,
      `${category.id} (${category.name})`
    );

    return NextResponse.json({ message: "Kategori diperbarui", category });
  } catch (error) {
    console.error("[CATEGORY_UPDATE_ERROR]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

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
    const existing = await prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { articles: true } } },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Kategori tidak ditemukan" },
        { status: 404 }
      );
    }

    // Kategori dengan artikel tidak boleh dihapus
    if (existing._count.articles > 0) {
      return NextResponse.json(
        {
          error: `Kategori masih memiliki ${existing._count.articles} artikel. Pindahkan atau hapus artikel dulu.`,
        },
        { status: 400 }
      );
    }

    await prisma.category.delete({ where: { id } });

    await logActivity(
      session.user.id,
      ActivityAction.DELETE_CATEGORY,
      `${existing.id} (${existing.name})`
    );

    return NextResponse.json({ message: "Kategori dihapus" });
  } catch (error) {
    console.error("[CATEGORY_DELETE_ERROR]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}