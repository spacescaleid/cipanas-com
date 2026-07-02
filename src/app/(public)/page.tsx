// src/app/(public)/page.tsx

import type { Metadata } from "next";
import Link from "next/link";
import { AdSlotDisplay } from "@/components/ads/AdSlotDisplay";
import { ArticleCard } from "@/components/articles/ArticleCard";
import { FeaturedArticle } from "@/components/articles/FeaturedArticle";
import { CategoryPill } from "@/components/articles/CategoryPill";
import prisma from "@/lib/prisma";
import { serializePrisma } from "@/lib/serialize";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Cipanas.com — Portal Berita Cipanas",
  description:
    "Portal berita terkini seputar Cipanas dan sekitarnya. Informasi terpercaya untuk warga Cipanas.",
};

export const revalidate = 300;

async function getHomepageData() {
  const [featuredRaw, latestRaw, categoriesRaw] = await Promise.all([
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
  ]);

  const featured = featuredRaw ? serializePrisma(featuredRaw) : null;
  const latest = serializePrisma(
    latestRaw.filter((a) => a.id !== featuredRaw?.id).slice(0, 12)
  );
  const categories = categoriesRaw.filter((c) => c._count.articles > 0);

  return { featured, latest, categories };
}

export default async function HomePage() {
  const { featured, latest, categories } = await getHomepageData();

  const mainArticles = latest.slice(0, 6);
  const secondaryArticles = latest.slice(6, 12);

  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* HEADER AD SLOT */}
      <div className="border-b border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <AdSlotDisplay position="HEADER" />
        </div>
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
            <div className="my-10 rounded-xl border border-dashed border-neutral-300 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900">
              <p className="mb-3 text-center text-xs uppercase tracking-wider text-neutral-400">
                Iklan
              </p>
              <AdSlotDisplay position="INLINE" />
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

      {/* FOOTER AD SLOT */}
      <div className="border-t border-neutral-200 bg-white py-6 dark:border-neutral-800 dark:bg-neutral-900">
        <div className="mx-auto max-w-7xl px-4">
          <AdSlotDisplay position="FOOTER" />
        </div>
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