// src/lib/articles.ts
import { prisma } from "./prisma";

/** Ambil artikel published terbaru */
export async function getLatestArticles(limit = 10) {
  return prisma.article.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    take: limit,
    include: {
      author: { select: { id: true, name: true, image: true } },
      category: { select: { id: true, name: true, slug: true } },
    },
  });
}

/** Ambil 1 artikel utama (headline) — yang terbaru */
export async function getHeadlineArticle() {
  return prisma.article.findFirst({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    include: {
      author: { select: { id: true, name: true, image: true } },
      category: { select: { id: true, name: true, slug: true } },
    },
  });
}

/** Artikel terpopuler (by viewCount) */
export async function getPopularArticles(limit = 5) {
  return prisma.article.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { viewCount: "desc" },
    take: limit,
    include: {
      category: { select: { id: true, name: true, slug: true } },
    },
  });
}

/** Artikel per kategori */
export async function getArticlesByCategory(categorySlug: string, limit = 6) {
  return prisma.article.findMany({
    where: {
      status: "PUBLISHED",
      category: { slug: categorySlug },
    },
    orderBy: { publishedAt: "desc" },
    take: limit,
    include: {
      author: { select: { id: true, name: true } },
      category: { select: { id: true, name: true, slug: true } },
    },
  });
}

/** Semua kategori */
export async function getAllCategories() {
  return prisma.category.findMany({
    orderBy: { name: "asc" },
  });
}

/** Detail artikel by slug — sekaligus tambah view count */
export async function getArticleBySlug(slug: string) {
  const article = await prisma.article.findUnique({
    where: { slug },
    include: {
      author: {
        select: { id: true, name: true, image: true, bio: true },
      },
      category: { select: { id: true, name: true, slug: true } },
    },
  });

  if (!article || article.status !== "PUBLISHED") return null;

  // Increment view count (fire and forget)
  prisma.article
    .update({
      where: { id: article.id },
      data: { viewCount: { increment: 1 } },
    })
    .catch(() => {}); // ignore error

  return article;
}

/** Artikel terkait (same category, exclude current) */
export async function getRelatedArticles(
  articleId: string,
  categoryId: string,
  limit = 3
) {
  return prisma.article.findMany({
    where: {
      status: "PUBLISHED",
      categoryId,
      id: { not: articleId },
    },
    orderBy: { publishedAt: "desc" },
    take: limit,
    include: {
      category: { select: { name: true, slug: true } },
    },
  });
}

export type ArticleWithRelations = Awaited<
  ReturnType<typeof getLatestArticles>
>[number];