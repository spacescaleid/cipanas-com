// src/lib/notification-counts.ts

import { prisma } from "@/lib/prisma";

/**
 * Badge counts untuk admin sidebar.
 * Setiap angka = "berapa item yang butuh perhatian/tindakan admin sekarang".
 */
export async function getAdminPendingCounts() {
  const [pendingArticles, pendingVideos, pendingComments, pendingAds] =
    await Promise.all([
      prisma.article.count({ where: { status: "PENDING" } }),
      prisma.video.count({ where: { status: "PENDING" } }),
      prisma.comment.count({ where: { status: "PENDING" } }),
      prisma.adOrder.count({
        where: {
          status: {
            in: ["PENDING_PAYMENT", "AWAITING_CREATIVE", "PENDING_REVIEW"],
          },
        },
      }),
    ]);

  return {
    articles: pendingArticles,
    videos: pendingVideos,
    comments: pendingComments,
    ads: pendingAds,
  };
}

/**
 * Badge counts untuk kontributor sidebar.
 * Angka = "berapa item milik KAMU yang butuh perhatian".
 *
 * PENTING: filter by userId supaya kontributor CUMA lihat angka punya sendiri,
 * bukan data orang lain.
 */
export async function getContributorPendingCounts(userId: string) {
  const [revisionArticles] = await Promise.all([
    // Artikel milik user ini yang butuh revisi
    prisma.article.count({
      where: {
        authorId: userId,
        status: "REVISION",
      },
    }),
  ]);

  return {
    revisionArticles,
  };
}