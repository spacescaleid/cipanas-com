// src/app/api/articles/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import slugify from "slugify";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createArticleSchema } from "@/lib/article-schema";
import { sanitizeArticleHtml, sanitizeText } from "@/lib/sanitize";

async function generateUniqueSlug(title: string): Promise<string> {
  const base = slugify(title, { lower: true, strict: true, locale: "id" });
  let slug = base;
  let counter = 1;

  while (await prisma.article.findUnique({ where: { slug } })) {
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

  const role = session.user.role;
  if (role === "VISITOR") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const parsed = createArticleSchema.safeParse(body);

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

    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });
    if (!category) {
      return NextResponse.json(
        { error: "Kategori tidak ditemukan" },
        { status: 400 }
      );
    }

    const slug = await generateUniqueSlug(safeTitle);

    const galleryPhotos = Array.isArray(body.galleryPhotos)
      ? body.galleryPhotos.slice(0, 10)
      : [];

    const article = await prisma.$transaction(async (tx) => {
      const newArticle = await tx.article.create({
        data: {
          title: safeTitle,
          slug,
          content: safeContent,
          coverImage: coverImage || null,
          categoryId,
          authorId: session.user.id,
          status: action,
        },
        select: { id: true, slug: true, status: true },
      });

      if (galleryPhotos.length > 0) {
        await tx.articleImage.createMany({
          data: galleryPhotos.map(
            (
              photo: { url: string; title?: string; caption?: string; order?: number },
              index: number
            ) => ({
              articleId: newArticle.id,
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

      return newArticle;
    });

    return NextResponse.json(
      {
        message:
          action === "PENDING"
            ? "Artikel dikirim untuk review"
            : "Draft berhasil disimpan",
        article,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[ARTICLE_CREATE_ERROR]", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}