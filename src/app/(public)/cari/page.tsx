// src/app/(public)/cari/page.tsx
import type { Metadata } from "next";
import { Suspense } from "react";

import { searchArticles } from "@/lib/articles";
import { ArticleCard } from "@/components/article/ArticleCard";
import { SearchForm } from "@/components/search/SearchForm";
import { SearchX } from "lucide-react";

export const metadata: Metadata = {
  title: "Cari Berita — Cipanas.com",
};

type Props = {
  searchParams: Promise<{ q?: string }>;
};

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";
  const results = query ? await searchArticles(query, 20) : [];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 animate-fade-in">
      <div className="mb-8 text-center">
        <h1 className="font-serif text-4xl font-bold text-neutral-900 dark:text-white md:text-5xl">
          Cari Berita
        </h1>
        <p className="mt-3 text-neutral-600 dark:text-neutral-400">
          Temukan berita seputar Cipanas dan sekitarnya
        </p>
      </div>

      <div className="mx-auto max-w-2xl">
        <Suspense fallback={<div className="h-16 rounded-full bg-neutral-100 animate-pulse dark:bg-neutral-800" />}>
          <SearchForm />
        </Suspense>
      </div>

      {/* Hasil */}
      {query && (
        <div className="mt-10">
          <div className="mb-6 text-sm text-neutral-600 dark:text-neutral-400">
            {results.length > 0 ? (
              <>
                Menampilkan <strong>{results.length}</strong> hasil untuk{" "}
                <span className="font-serif italic text-neutral-900 dark:text-white">
                  &ldquo;{query}&rdquo;
                </span>
              </>
            ) : (
              <>
                Tidak ada hasil untuk{" "}
                <span className="font-serif italic text-neutral-900 dark:text-white">
                  &ldquo;{query}&rdquo;
                </span>
              </>
            )}
          </div>

          {results.length === 0 ? (
            <div className="rounded-xl border border-dashed border-neutral-300 py-16 text-center dark:border-neutral-700">
              <SearchX className="mx-auto h-12 w-12 text-neutral-400" />
              <p className="mt-4 text-neutral-600 dark:text-neutral-400">
                Coba dengan kata kunci lain.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {results.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          )}
        </div>
      )}

      {!query && (
        <div className="mt-10 text-center text-sm text-neutral-500">
          Ketik kata kunci untuk mulai mencari.
        </div>
      )}
    </div>
  );
}