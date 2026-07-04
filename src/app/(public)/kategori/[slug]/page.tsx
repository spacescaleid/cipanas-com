// src/app/(public)/kategori/[slug]/page.tsx
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Suspense } from "react";

import {
  getCategoryBySlug,
  getArticlesByCategoryPaginated,
} from "@/lib/articles";
import { ArticleCard } from "@/components/article/ArticleCard";
import { PopularSidebar } from "@/components/article/PopularSidebar";
import { Pagination } from "@/components/ui/Pagination";
import { AdSlotDisplay } from "@/components/ads/AdSlotDisplay";
import { getPaginationMeta, DEFAULT_ITEMS_PER_PAGE } from "@/lib/pagination";

export const revalidate = 60;

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) return { title: "Kategori tidak ditemukan" };

  return {
    title: `${category.name} — Cipanas.com`,
    description: `Kumpulan berita terkini kategori ${category.name} dari Cipanas.com`,
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);

  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const { articles, currentPage, total } = await getArticlesByCategoryPaginated(
    slug,
    page,
    DEFAULT_ITEMS_PER_PAGE
  );

  // Hitung meta pagination pakai utility baru
  const paginationMeta = getPaginationMeta({
    currentPage,
    totalItems: total,
    itemsPerPage: DEFAULT_ITEMS_PER_PAGE,
  });

  return (
    <div className="animate-fade-in">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8 border-b border-neutral-200 pb-6 dark:border-neutral-800">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
            Kategori
          </div>
          <h1 className="font-serif text-4xl font-bold text-neutral-900 dark:text-white md:text-5xl">
            {category.name}
          </h1>
          <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400">
            {total} artikel terpublikasi
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {articles.length === 0 ? (
              <div className="rounded-xl border border-dashed border-neutral-300 p-12 text-center text-neutral-500 dark:border-neutral-700">
                Belum ada artikel di kategori ini.
              </div>
            ) : (
              <>
                <div className="grid gap-6 sm:grid-cols-2">
                  {articles.map((article) => (
                    <ArticleCard key={article.id} article={article} />
                  ))}
                </div>

                <Pagination
                  meta={paginationMeta}
                  basePath={`/kategori/${slug}`}
                  label="artikel"
                />
              </>
            )}
          </div>

          <aside className="space-y-6">
            <div className="lg:sticky lg:top-32 space-y-6">
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
          </aside>
        </div>
      </div>
    </div>
  );
}