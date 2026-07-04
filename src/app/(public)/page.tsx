// src/app/(public)/page.tsx

import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { AdSlotDisplay } from "@/components/ads/AdSlotDisplay";
import { ArticleCard } from "@/components/article/ArticleCard";
import { FeaturedArticle } from "@/components/article/FeaturedArticle";
import { CategoryPill } from "@/components/article/CategoryPill";
import prisma from "@/lib/prisma";
import { serializePrisma } from "@/lib/serialize";
import { formatRelativeTime } from "@/lib/format";
import { ArrowRight, PlayCircle, Video as VideoIcon, Eye, MessageSquare } from "lucide-react";

export const metadata: Metadata = {
  title: "Cipanas.com — Portal Berita Cipanas",
  description:
    "Portal berita terkini seputar Cipanas dan sekitarnya. Informasi terpercaya untuk warga Cipanas.",
};

export const revalidate = 300;

async function getHomepageData() {
  const [featuredRaw, latestRaw, categoriesRaw, latestVideosRaw] = await Promise.all([
    prisma.article.findFirst({
      where: { status: "PUBLISHED" },
      include: {
        author: { select: { name: true } },
        category: { select: { name: true, slug: true } },
      },
      orderBy: [{ publishedAt: "desc" }],
    }),

    prisma.article.findMany({
      where: { status: "PUBLISHED" },
      include: {
        author: { select: { name: true } },
        category: { select: { name: true, slug: true } },
      },
      orderBy: { publishedAt: "desc" },
      take: 13,
    }),

    prisma.category.findMany({
      include: {
        _count: {
          select: {
            articles: {
              where: { status: "PUBLISHED" },
            },
          },
        },
      },
      orderBy: { name: "asc" },
    }),

    // BARU: Ambil 3 video terbaru untuk homepage
    prisma.video.findMany({
      where: { status: "PUBLISHED" },
      include: {
        author: { select: { name: true } },
        _count: {
          select: { comments: { where: { status: "APPROVED" } } },
        },
      },
      orderBy: { publishedAt: "desc" },
      take: 3,
    }),
  ]);

  const featured = featuredRaw ? serializePrisma(featuredRaw) : null;
  const latest = serializePrisma(
    latestRaw.filter((a) => a.id !== featuredRaw?.id).slice(0, 12)
  );
  const categories = categoriesRaw.filter((c) => c._count.articles > 0);
  const latestVideos = serializePrisma(latestVideosRaw);

  return { featured, latest, categories, latestVideos };
}

export default async function HomePage() {
  const { featured, latest, categories, latestVideos } = await getHomepageData();

  const mainArticles = latest.slice(0, 6);
  const secondaryArticles = latest.slice(6, 12);

  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* HEADER AD SLOT */}
      <div className="w-full">
        <AdSlotDisplay position="HEADER" />
      </div>

      {/* KATEGORI CHIPS */}
      {categories.length > 0 && (
        <div className="border-b border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
          <div className="mx-auto max-w-7xl px-4 py-3">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
              <span className="shrink-0 text-xs font-medium uppercase tracking-wider text-neutral-500">
                Kategori:
              </span>
              {categories.map((cat) => (
                <CategoryPill
                  key={cat.id}
                  name={cat.name}
                  slug={cat.slug}
                  count={cat._count.articles}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTENT */}
      <div className="mx-auto max-w-7xl px-4 py-8">
        {featured && (
          <section className="mb-10">
            <FeaturedArticle article={featured} />
          </section>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
          {/* MAIN COLUMN */}
          <div className="min-w-0">
            {/* Section: Berita Terbaru */}
            <section className="mb-10">
              <SectionHeader
                title="Berita Terbaru"
                description="Update terkini seputar Cipanas"
              />
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {mainArticles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            </section>

            {/* Inline Ad */}
            <div className="my-10 flex justify-center">
              <div className="w-full max-w-[600px] rounded-xl border border-dashed border-neutral-300 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900">
                <p className="mb-3 text-center text-xs uppercase tracking-wider text-neutral-400">
                  Iklan
                </p>
                <AdSlotDisplay position="INLINE" />
              </div>
            </div>

            {/* Section: Berita Lainnya */}
            {secondaryArticles.length > 0 && (
              <section>
                <SectionHeader
                  title="Berita Lainnya"
                  description="Artikel menarik lainnya"
                />
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {secondaryArticles.map((article) => (
                    <ArticleCard key={article.id} article={article} />
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* SIDEBAR */}
          <aside className="lg:sticky lg:top-4 lg:self-start">
            <div className="space-y-6">
              {/* Sidebar Ad */}
              <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
                <p className="mb-3 text-center text-xs uppercase tracking-wider text-neutral-400">
                  Iklan
                </p>
                <AdSlotDisplay position="SIDEBAR" />
              </div>

              {/* Widget: Kategori */}
              {categories.length > 0 && (
                <div className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
                  <h3 className="mb-3 font-serif text-lg font-bold text-neutral-900 dark:text-white">
                    Jelajahi Kategori
                  </h3>
                  <ul className="space-y-2">
                    {categories.slice(0, 8).map((cat) => (
                      <li key={cat.id}>
                        <Link
                          href={`/kategori/${cat.slug}`}
                          className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-800"
                        >
                          <span>{cat.name}</span>
                          <span className="text-xs text-neutral-500">
                            {cat._count.articles}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Widget: Pasang Iklan CTA */}
              <div className="rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 p-6 text-white">
                <h3 className="mb-2 font-serif text-lg font-bold">
                  Pasang Iklan Anda
                </h3>
                <p className="mb-4 text-sm text-blue-100">
                  Jangkau ribuan pembaca Cipanas.com setiap harinya.
                </p>
                <Link
                  href="/pasang-iklan"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50"
                >
                  Mulai Sekarang
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* SECTION: VIDEO TERBARU (BARU) — Full width sebelum footer ad  */}
      {/* ═══════════════════════════════════════════════════════════ */}
      {latestVideos.length > 0 && (
        <section className="border-t border-neutral-200 bg-white py-12 dark:border-neutral-800 dark:bg-neutral-900">
          <div className="mx-auto max-w-7xl px-4">
            {/* Section header */}
            <div className="mb-6 flex items-end justify-between border-b-2 border-neutral-900 pb-2 dark:border-white">
              <div className="flex items-center gap-2">
                <VideoIcon className="h-6 w-6 text-brand-600 dark:text-brand-400" />
                <div>
                  <h2 className="font-serif text-2xl font-bold text-neutral-900 dark:text-white">
                    Video Terbaru
                  </h2>
                  <p className="mt-0.5 text-sm text-neutral-500">
                    Liputan video dari kontributor Cipanas
                  </p>
                </div>
              </div>
              <Link
                href="/video"
                className="hidden shrink-0 items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700 sm:inline-flex dark:text-brand-400"
              >
                Lihat Semua
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Grid 3 kolom */}
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {latestVideos.map((video) => (
                <Link
                  key={video.id}
                  href={`/video/${video.slug}`}
                  className="group overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-card transition hover:shadow-card-hover dark:border-neutral-800 dark:bg-neutral-900"
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                    {video.thumbnail ? (
                      <Image
                        src={video.thumbnail}
                        alt={video.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition duration-500 group-hover:scale-105"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <VideoIcon className="h-16 w-16 text-neutral-400" />
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition group-hover:opacity-100">
                      <PlayCircle className="h-16 w-16 text-white drop-shadow-lg" />
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <h3 className="line-clamp-2 font-serif text-base font-bold leading-snug text-neutral-900 group-hover:text-brand-700 dark:text-white dark:group-hover:text-brand-400">
                      {video.title}
                    </h3>
                    <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-500">
                      <span>{video.author.name}</span>
                      {video.publishedAt && (
                        <>
                          <span>•</span>
                          <span>{formatRelativeTime(video.publishedAt)}</span>
                        </>
                      )}
                    </div>
                    <div className="mt-2 flex items-center gap-3 text-xs text-neutral-500">
                      <span className="inline-flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {video.viewCount}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        {video._count.comments}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Mobile: Lihat Semua button */}
            <div className="mt-6 text-center sm:hidden">
              <Link
                href="/video"
                className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400"
              >
                Lihat Semua Video
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* FOOTER AD SLOT */}
      <div className="w-full">
        <AdSlotDisplay position="FOOTER" />
      </div>
    </main>
  );
}

function SectionHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-5 flex items-end justify-between border-b-2 border-neutral-900 pb-2 dark:border-white">
      <div>
        <h2 className="font-serif text-2xl font-bold text-neutral-900 dark:text-white">
          {title}
        </h2>
        {description && (
          <p className="mt-0.5 text-sm text-neutral-500">{description}</p>
        )}
      </div>
    </div>
  );
}