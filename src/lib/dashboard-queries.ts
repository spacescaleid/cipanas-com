// src/lib/dashboard-queries.ts
import type { ArticleStatus } from "@prisma/client";
import { prisma } from "./prisma";

/** Statistik dashboard kontributor */
export async function getContributorStats(userId: string) {
  const [total, published, draft, pending, revision, totalViews] =
    await Promise.all([
      prisma.article.count({ where: { authorId: userId } }),
      prisma.article.count({
        where: { authorId: userId, status: "PUBLISHED" },
      }),
      prisma.article.count({ where: { authorId: userId, status: "DRAFT" } }),
      prisma.article.count({ where: { authorId: userId, status: "PENDING" } }),
      prisma.article.count({
        where: { authorId: userId, status: "REVISION" },
      }),
      prisma.article.aggregate({
        where: { authorId: userId, status: "PUBLISHED" },
        _sum: { viewCount: true },
      }),
    ]);

  return {
    total,
    published,
    draft,
    pending,
    revision,
    totalViews: totalViews._sum.viewCount ?? 0,
  };
}

/** List artikel milik user (tanpa filter) */
export async function getMyArticles(userId: string) {
  return prisma.article.findMany({
    where: { authorId: userId },
    orderBy: { updatedAt: "desc" },
    include: {
      category: { select: { id: true, name: true, slug: true } },
    },
  });
}

/** Ambil 1 artikel milik user (untuk edit) */
export async function getMyArticleById(userId: string, id: string) {
  return prisma.article.findFirst({
    where: { id, authorId: userId },
    include: {
      category: { select: { id: true, name: true, slug: true } },
    },
  });
}

/** List artikel user dengan filter status */
export async function getMyArticlesFiltered(
  userId: string,
  status?: ArticleStatus
) {
  return prisma.article.findMany({
    where: {
      authorId: userId,
      ...(status ? { status } : {}),
    },
    orderBy: { updatedAt: "desc" },
    include: {
      category: { select: { id: true, name: true, slug: true } },
    },
  });
}

/** Count artikel per status untuk badge di filter */
export async function getMyArticleCounts(userId: string) {
  const counts = await prisma.article.groupBy({
    by: ["status"],
    where: { authorId: userId },
    _count: { status: true },
  });

  const map: Record<string, number> = {
    ALL: 0,
    DRAFT: 0,
    PENDING: 0,
    REVISION: 0,
    PUBLISHED: 0,
    REJECTED: 0,
  };

  counts.forEach((c) => {
    map[c.status] = c._count.status;
    map.ALL += c._count.status;
  });

  return map;
}

// Tambahkan di src/lib/dashboard-queries.ts

/** Top artikel user berdasarkan view count */
export async function getMyTopArticles(userId: string, limit = 5) {
  return prisma.article.findMany({
    where: { authorId: userId, status: "PUBLISHED" },
    orderBy: { viewCount: "desc" },
    take: limit,
    select: {
      id: true,
      title: true,
      slug: true,
      viewCount: true,
      publishedAt: true,
      category: { select: { name: true } },
    },
  });
}

/** Statistik view per kategori (untuk chart pie/bar) */
export async function getViewsByCategory(userId: string) {
  const articles = await prisma.article.findMany({
    where: { authorId: userId, status: "PUBLISHED" },
    select: {
      viewCount: true,
      category: { select: { name: true } },
    },
  });

  const grouped = new Map<string, number>();
  for (const a of articles) {
    const key = a.category.name;
    grouped.set(key, (grouped.get(key) ?? 0) + a.viewCount);
  }

  return Array.from(grouped.entries()).map(([name, views]) => ({
    name,
    views,
  }));
}

/**
 * Statistik artikel yang dipublish per bulan (12 bulan terakhir).
 * Return array untuk chart line/bar.
 */
export async function getPublishedByMonth(userId: string) {
  const now = new Date();
  const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);

  const articles = await prisma.article.findMany({
    where: {
      authorId: userId,
      status: "PUBLISHED",
      publishedAt: { gte: twelveMonthsAgo },
    },
    select: { publishedAt: true, viewCount: true },
  });

  // Buat map 12 bulan
  const months: { key: string; label: string; published: number; views: number }[] =
    [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("id-ID", {
      month: "short",
      year: "2-digit",
    });
    months.push({ key, label, published: 0, views: 0 });
  }

  for (const a of articles) {
    if (!a.publishedAt) continue;
    const key = `${a.publishedAt.getFullYear()}-${String(
      a.publishedAt.getMonth() + 1
    ).padStart(2, "0")}`;
    const m = months.find((x) => x.key === key);
    if (m) {
      m.published += 1;
      m.views += a.viewCount;
    }
  }

  return months;
}

/**
 * Notifikasi = perubahan status artikel user, diurutkan dari terbaru.
 * Kita derive dari updatedAt + status + revisionNote.
 */
export async function getMyNotifications(userId: string, limit = 30) {
  const articles = await prisma.article.findMany({
    where: {
      authorId: userId,
      status: { in: ["PUBLISHED", "REVISION", "REJECTED"] },
    },
    orderBy: { updatedAt: "desc" },
    take: limit,
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      revisionNote: true,
      updatedAt: true,
      publishedAt: true,
    },
  });

  return articles;
}