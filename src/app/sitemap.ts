import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://cipanas.com";

// Regenerate sitemap tiap 1 jam supaya artikel/video baru cepat masuk index
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date() },
    { url: `${BASE_URL}/video`, lastModified: new Date() },
    { url: `${BASE_URL}/tentang`, lastModified: new Date() },
    { url: `${BASE_URL}/kontak`, lastModified: new Date() },
    { url: `${BASE_URL}/pasang-iklan`, lastModified: new Date() },
  ];

  // Fetch dynamic routes dengan graceful fallback:
  // Kalau DB tidak reachable (mis. Neon cold-start saat build),
  // sitemap tetap ter-generate dengan static routes saja — jangan sampai
  // gagalkan seluruh build hanya karena sitemap.
  let articleRoutes: MetadataRoute.Sitemap = [];
  let videoRoutes: MetadataRoute.Sitemap = [];

  try {
    const articles = await prisma.article.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, updatedAt: true },
    });
    articleRoutes = articles.map((article) => ({
      url: `${BASE_URL}/berita/${article.slug}`,
      lastModified: article.updatedAt,
    }));
  } catch (error) {
    console.warn("[sitemap] Failed to fetch articles, skipping:", error);
  }

  try {
    const videos = await prisma.video.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, updatedAt: true },
    });
    videoRoutes = videos.map((video) => ({
      url: `${BASE_URL}/video/${video.slug}`,
      lastModified: video.updatedAt,
    }));
  } catch (error) {
    console.warn("[sitemap] Failed to fetch videos, skipping:", error);
  }

  return [...staticRoutes, ...articleRoutes, ...videoRoutes];
}