// src/app/api/admin/categories/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import slugify from "slugify";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { categorySchema } from "@/lib/category-schema";
import { logActivity, ActivityAction } from "@/lib/activity-logger";

async function generateUniqueCategorySlug(name: string): Promise<string> {
  const base = slugify(name, { lower: true, strict: true, locale: "id" });
  let slug = base;
  let counter = 1;
  while (await prisma.category.findUnique({ where: { slug } })) {
    slug = `${base}-${counter}`;
    counter += 1;
  }
  return slug;
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

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

    const { name } = parsed.data;

    // Cek duplikat nama
    const existing = await prisma.category.findUnique({ where: { name } });
    if (existing) {
      return NextResponse.json(
        { error: "Kategori dengan nama tersebut sudah ada" },
        { status: 409 }
      );
    }

    const slug = await generateUniqueCategorySlug(name);

    const category = await prisma.category.create({
      data: { name, slug },
    });

    await logActivity(
      session.user.id,
      ActivityAction.CREATE_CATEGORY,
      `${category.id} (${category.name})`
    );

    return NextResponse.json(
      { message: "Kategori dibuat", category },
      { status: 201 }
    );
  } catch (error) {
    console.error("[CATEGORY_CREATE_ERROR]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}