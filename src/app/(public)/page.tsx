// src/app/(public)/page.tsx
import { Suspense } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import {
  getHeadlineArticle,
  getLatestArticles,
  getAllCategories,
  getArticlesByCategory,
} from "@/lib/articles";
import { ArticleCard } from "@/components/article/ArticleCard";
import { ArticleCardLarge } from "@/components/article/ArticleCardLarge";
import { PopularSidebar } from "@/components/article/PopularSidebar";
import { AdSlotDisplay } from "@/components/ads/AdSlotDisplay";

export const revalidate = 60;

export default async function HomePage() {
  const [headline, latest, categories] = await Promise.all([
    getHeadlineArticle(),
    getLatestArticles(7),
    getAllCategories(),
  ]);

  const secondaryArticles = latest.slice(1, 5);
  const olderArticles = latest.slice(5);

  return (
    <div className="animate-fade-in">
      <div className="mx-auto max-w-7xl px-4 py-6 md:py-8">
        {/* HERO */}
        <section className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {headline && <ArticleCardLarge article={headline} />}
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            {secondaryArticles.slice(0, 2).map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </section>

        {/* HEADER AD */}
        <section className="mt-8">
          <Suspense
            fallback={
              <div className="h-24 animate-pulse rounded-xl bg-neutral-100 dark:bg-neutral-800" />
            }
          >
            <AdSlotDisplay position="HEADER" />
          </Suspense>
        </section>

        {/* MAIN GRID */}
        <section className="mt-12 grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="mb-5 flex items-end justify-between border-b border-neutral-200 pb-3 dark:border-neutral-800">
              <h2 className="font-serif text-2xl font-bold text-neutral-900 dark:text-white">
                Berita Terbaru
              </h2>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              {olderArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
              {secondaryArticles.slice(2).map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <Suspense
              fallback={
                <div className="h-96 animate-pulse rounded-xl bg-neutral-100 dark:bg-neutral-800" />
              }
            >
              <PopularSidebar />
            </Suspense>

            <Suspense
              fallback={
                <div className="h-64 animate-pulse rounded-xl bg-neutral-100 dark:bg-neutral-800" />
              }
            >
              <AdSlotDisplay position="SIDEBAR" />
            </Suspense>
          </div>
        </section>

        {/* SECTIONS PER KATEGORI */}
        {categories.slice(0, 3).map((cat) => (
          <CategorySection
            key={cat.id}
            categorySlug={cat.slug}
            categoryName={cat.name}
          />
        ))}

        {/* FOOTER AD */}
        <section className="mt-12">
          <Suspense
            fallback={
              <div className="h-20 animate-pulse rounded-xl bg-neutral-100 dark:bg-neutral-800" />
            }
          >
            <AdSlotDisplay position="FOOTER" />
          </Suspense>
        </section>
      </div>
    </div>
  );
}

async function CategorySection({
  categorySlug,
  categoryName,
}: {
  categorySlug: string;
  categoryName: string;
}) {
  const articles = await getArticlesByCategory(categorySlug, 3);

  if (articles.length === 0) return null;

  return (
    <section className="mt-12 animate-slide-up">
      <div className="mb-5 flex items-end justify-between border-b border-neutral-200 pb-3 dark:border-neutral-800">
        <h2 className="font-serif text-2xl font-bold text-neutral-900 dark:text-white">
          {categoryName}
        </h2>
        <Link
          href={`/kategori/${categorySlug}`}
          className="flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
        >
          Lihat semua <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </section>
  );
}