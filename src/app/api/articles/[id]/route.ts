// src/app/api/articles/[id]/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateArticleSchema } from "@/lib/article-schema";
import { sanitizeArticleHtml, sanitizeText } from "@/lib/sanitize";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, { params }: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

    const isOwner = existing.authorId === session.user.id;
    const isAdmin =
      session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN";

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (isOwner && !isAdmin && existing.status === "PUBLISHED") {
      return NextResponse.json(
        { error: "Artikel yang sudah tayang tidak dapat diedit" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const parsed = updateArticleSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Data tidak valid",
          issues: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { title, content, coverImage, categoryId, action } = parsed.data;

    const safeTitle = sanitizeText(title).trim();
    const safeContent = sanitizeArticleHtml(content);

    if (safeTitle.length < 5) {
      return NextResponse.json(
        { error: "Judul terlalu pendek setelah sanitasi" },
        { status: 400 }
      );
    }

    const galleryPhotos = Array.isArray(body.galleryPhotos)
      ? body.galleryPhotos.slice(0, 10)
      : null;

    const article = await prisma.$transaction(async (tx) => {
      const updated = await tx.article.update({
        where: { id },
        data: {
          title: safeTitle,
          content: safeContent,
          coverImage: coverImage || null,
          categoryId,
          status: action,
          revisionNote:
            existing.status === "REVISION" ? null : existing.revisionNote,
        },
        select: { id: true, slug: true, status: true },
      });

      if (galleryPhotos !== null) {
        await tx.articleImage.deleteMany({
          where: { articleId: id },
        });

        if (galleryPhotos.length > 0) {
          await tx.articleImage.createMany({
            data: galleryPhotos.map(
              (
                photo: { url: string; title?: string; caption?: string; order?: number },
                index: number
              ) => ({
                articleId: id,
                url: photo.url,
                title: photo.title
                  ? sanitizeText(photo.title).trim() || null
                  : null,
                caption: photo.caption
                  ? sanitizeText(photo.caption).trim() || null
                  : null,
                order: photo.order ?? index,
              })
            ),
          });
        }
      }

      return updated;
    });

    return NextResponse.json({
      message:
        action === "PENDING"
          ? "Artikel dikirim untuk review"
          : "Draft diperbarui",
      article,
    });
  } catch (error) {
    console.error("[ARTICLE_UPDATE_ERROR]", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

    const isOwner = existing.authorId === session.user.id;
    const isAdmin =
      session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN";

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (
      isOwner &&
      !isAdmin &&
      (existing.status === "PUBLISHED" || existing.status === "PENDING")
    ) {
      return NextResponse.json(
        {
          error:
            "Artikel yang sedang direview atau sudah tayang tidak dapat dihapus",
        },
        { status: 400 }
      );
    }

    await prisma.article.delete({ where: { id } });

    return NextResponse.json({ message: "Artikel dihapus" });
  } catch (error) {
    console.error("[ARTICLE_DELETE_ERROR]", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}