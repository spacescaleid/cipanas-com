// src/lib/admin-queries.ts
import type { ArticleStatus } from "@prisma/client";
import { prisma } from "./prisma";

/** Statistik overview untuk dashboard admin */
export async function getAdminStats() {
  const [
    totalArticles,
    publishedArticles,
    pendingArticles,
    revisionArticles,
    totalUsers,
    totalContributors,
    totalCategories,
    activeAds,
    totalViews,
    totalRevenue,
  ] = await Promise.all([
    prisma.article.count(),
    prisma.article.count({ where: { status: "PUBLISHED" } }),
    prisma.article.count({ where: { status: "PENDING" } }),
    prisma.article.count({ where: { status: "REVISION" } }),
    prisma.user.count(),
    prisma.user.count({ where: { role: "CONTRIBUTOR" } }),
    prisma.category.count(),
    prisma.adOrder.count({ where: { status: "ACTIVE" } }),
    prisma.article.aggregate({
      where: { status: "PUBLISHED" },
      _sum: { viewCount: true },
    }),
    prisma.adOrder.aggregate({
      where: { status: { in: ["ACTIVE", "EXPIRED"] } },
      _sum: { totalPrice: true },
    }),
  ]);

  return {
    totalArticles,
    publishedArticles,
    pendingArticles,
    revisionArticles,
    totalUsers,
    totalContributors,
    totalCategories,
    activeAds,
    totalViews: totalViews._sum.viewCount ?? 0,
    totalRevenue: Number(totalRevenue._sum.totalPrice ?? 0),
  };
}

/** Chart: artikel di-publish per bulan (12 bulan terakhir) */
export async function getPublishedArticlesByMonth() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - 11, 1);

  const articles = await prisma.article.findMany({
    where: {
      status: "PUBLISHED",
      publishedAt: { gte: start },
    },
    select: { publishedAt: true, viewCount: true },
  });

  const months: {
    key: string;
    label: string;
    published: number;
    views: number;
  }[] = [];
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

/** Distribusi artikel per kategori */
export async function getArticleCountByCategory() {
  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: {
          articles: { where: { status: "PUBLISHED" } },
        },
      },
    },
  });

  return categories.map((c) => ({
    name: c.name,
    count: c._count.articles,
  }));
}

/** List artikel untuk admin dengan filter */
export async function getAdminArticles(status?: ArticleStatus) {
  return prisma.article.findMany({
    where: status ? { status } : {},
    orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
    include: {
      author: { select: { id: true, name: true, email: true, image: true } },
      category: { select: { id: true, name: true, slug: true } },
    },
  });
}

/** Detail artikel untuk admin (tidak dibatasi ownership) */
export async function getAdminArticleById(id: string) {
  return prisma.article.findUnique({
    where: { id },
    include: {
      author: {
        select: { id: true, name: true, email: true, image: true, role: true },
      },
      category: { select: { id: true, name: true, slug: true } },
    },
  });
}

/** Count artikel per status untuk badge filter */
export async function getAdminArticleCounts() {
  const counts = await prisma.article.groupBy({
    by: ["status"],
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

/** 5 aktivitas admin terbaru */
export async function getRecentActivities(limit = 5) {
  return prisma.activityLog.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      user: { select: { id: true, name: true, image: true } },
    },
  });
}

// Tambahkan di src/lib/admin-queries.ts


/** List semua user dengan count artikel */
export async function getAllUsers() {
  return prisma.user.findMany({
    orderBy: [{ role: "asc" }, { createdAt: "desc" }],
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      bio: true,
      createdAt: true,
      _count: { select: { articles: true } },
    },
  });
}

/** Count user per role untuk filter badges */
export async function getUserCountsByRole() {
  const counts = await prisma.user.groupBy({
    by: ["role"],
    _count: { role: true },
  });

  const map: Record<string, number> = {
    ALL: 0,
    VISITOR: 0,
    CONTRIBUTOR: 0,
    ADMIN: 0,
    SUPER_ADMIN: 0,
  };
  counts.forEach((c) => {
    map[c.role] = c._count.role;
    map.ALL += c._count.role;
  });
  return map;
}

/** List activity log dengan pagination + filter action */
export async function getActivityLogs({
  page = 1,
  pageSize = 30,
  action,
}: {
  page?: number;
  pageSize?: number;
  action?: string;
}) {
  const where = action ? { action } : {};
  const skip = (page - 1) * pageSize;

  const [logs, total] = await Promise.all([
    prisma.activityLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true, role: true },
        },
      },
    }),
    prisma.activityLog.count({ where }),
  ]);

  return {
    logs,
    total,
    totalPages: Math.ceil(total / pageSize),
    currentPage: page,
  };
}

/** Ambil daftar unique action untuk filter dropdown */
export async function getUniqueLogActions() {
  const rows = await prisma.activityLog.findMany({
    distinct: ["action"],
    select: { action: true },
  });
  return rows.map((r) => r.action);
}

/** Detail user (untuk halaman detail — belum kita pakai tapi disiapkan) */
export async function getUserDetail(id: string) {
  return prisma.user.findUnique({
    where: { id },
    include: {
      _count: { select: { articles: true } },
      articles: {
        take: 5,
        orderBy: { updatedAt: "desc" },
        select: {
          id: true,
          title: true,
          slug: true,
          status: true,
          viewCount: true,
          updatedAt: true,
        },
      },
    },
  });
}

export type UserWithCount = Awaited<ReturnType<typeof getAllUsers>>[number];