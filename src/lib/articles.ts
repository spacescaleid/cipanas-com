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

/** Artikel per kategori (untuk section homepage) */
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

/** Ambil kategori detail + count artikel */
export async function getCategoryBySlug(slug: string) {
  return prisma.category.findUnique({
    where: { slug },
    include: {
      _count: {
        select: {
          articles: {
            where: { status: "PUBLISHED" },
          },
        },
      },
    },
  });
}

/** Ambil artikel per kategori dengan pagination */
export async function getArticlesByCategoryPaginated(
  categorySlug: string,
  page = 1,
  pageSize = 9
) {
  const skip = (page - 1) * pageSize;

  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where: {
        status: "PUBLISHED",
        category: { slug: categorySlug },
      },
      orderBy: { publishedAt: "desc" },
      skip,
      take: pageSize,
      include: {
        author: { select: { id: true, name: true, image: true } },
        category: { select: { id: true, name: true, slug: true } },
      },
    }),
    prisma.article.count({
      where: {
        status: "PUBLISHED",
        category: { slug: categorySlug },
      },
    }),
  ]);

  return {
    articles,
    total,
    totalPages: Math.ceil(total / pageSize),
    currentPage: page,
  };
}

/** Type helper untuk komponen yang butuh artikel dengan relasi */
export type ArticleWithRelations = Awaited<
  ReturnType<typeof getLatestArticles>
>[number];
// Tambahkan di src/lib/articles.ts

/** Search artikel berdasarkan judul/konten */
export async function searchArticles(query: string, limit = 20) {
  if (!query.trim()) return [];

  return prisma.article.findMany({
    where: {
      status: "PUBLISHED",
      OR: [
        { title: { contains: query, mode: "insensitive" } },
        { content: { contains: query, mode: "insensitive" } },
      ],
    },
    orderBy: { publishedAt: "desc" },
    take: limit,
    include: {
      author: { select: { id: true, name: true, image: true } },
      category: { select: { id: true, name: true, slug: true } },
    },
  });
}