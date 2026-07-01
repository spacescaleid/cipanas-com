// src/app/(public)/berita/[slug]/page.tsx
import { notFound } from "next/navigation";
import Image from "next/image";
import type { Metadata } from "next";
import { Suspense } from "react";
import { Clock, Eye, Calendar } from "lucide-react";

import { getArticleBySlug } from "@/lib/articles";
import {
  estimateReadingTime,
  formatDate,
  formatCompactNumber,
} from "@/lib/format";
import { CategoryBadge } from "@/components/ui/CategoryBadge";
import { ArticleContent } from "@/components/article/ArticleContent";
import { ShareButtons } from "@/components/article/ShareButtons";
import { AuthorCard } from "@/components/article/AuthorCard";
import { RelatedArticles } from "@/components/article/RelatedArticles";
import { PopularSidebar } from "@/components/article/PopularSidebar";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) return { title: "Artikel tidak ditemukan" };

  const description =
    article.content
      .replace(/<[^>]*>/g, "")
      .trim()
      .substring(0, 160) + "...";

  return {
    title: `${article.title} — Cipanas.com`,
    description,
    openGraph: {
      title: article.title,
      description,
      type: "article",
      images: article.coverImage ? [article.coverImage] : undefined,
      publishedTime: article.publishedAt?.toISOString(),
      authors: [article.author.name],
    },
  };
}

export default async function ArticleDetailPage({ params }: Props) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) notFound();

  const readingTime = estimateReadingTime(article.content);

  return (
    <article className="animate-fade-in">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid gap-10 lg:grid-cols-3">
          {/* Konten utama */}
          <div className="lg:col-span-2">
            {/* Breadcrumb sederhana */}
            <nav className="mb-4 text-xs text-neutral-500">
              <CategoryBadge
                name={article.category.name}
                slug={article.category.slug}
                size="md"
              />
            </nav>

            {/* Judul */}
            <h1 className="font-serif text-3xl font-bold leading-tight text-neutral-900 dark:text-white md:text-5xl">
              {article.title}
            </h1>

            {/* Meta */}
            <div className="mt-6 flex flex-wrap items-center gap-4 border-y border-neutral-200 py-4 text-sm text-neutral-600 dark:border-neutral-800 dark:text-neutral-400">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-neutral-900 dark:text-white">
                  {article.author.name}
                </span>
              </div>
              <span className="text-neutral-300 dark:text-neutral-700">•</span>
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                {formatDate(article.publishedAt ?? article.createdAt)}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                {readingTime} menit baca
              </span>
              <span className="flex items-center gap-1.5">
                <Eye className="h-3.5 w-3.5" />
                {formatCompactNumber(article.viewCount)} views
              </span>
            </div>

            {/* Cover Image */}
            {article.coverImage && (
              <div className="relative mt-6 aspect-[16/9] overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-800">
                <Image
                  src={article.coverImage}
                  alt={article.title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  className="object-cover"
                />
              </div>
            )}

            {/* Content */}
            <div className="mt-8">
              <ArticleContent html={article.content} />
            </div>

            {/* Placeholder ad inline */}
            <div className="my-10 flex h-24 items-center justify-center rounded-xl border-2 border-dashed border-neutral-300 text-sm text-neutral-500 dark:border-neutral-700">
              Slot Iklan Inline
            </div>

            {/* Share */}
            <div className="mt-8 border-t border-neutral-200 pt-6 dark:border-neutral-800">
              <ShareButtons title={article.title} slug={article.slug} />
            </div>

            {/* Author */}
            <AuthorCard
              name={article.author.name}
              image={article.author.image}
              bio={article.author.bio}
            />

            {/* Related */}
            <Suspense fallback={null}>
              <RelatedArticles
                articleId={article.id}
                categoryId={article.category.id}
              />
            </Suspense>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            <div className="lg:sticky lg:top-32">
              <Suspense
                fallback={
                  <div className="h-96 animate-pulse rounded-xl bg-neutral-100 dark:bg-neutral-800" />
                }
              >
                <PopularSidebar />
              </Suspense>

              <div className="mt-6 flex h-64 items-center justify-center rounded-xl border-2 border-dashed border-neutral-300 text-sm text-neutral-500 dark:border-neutral-700">
                Slot Iklan Sidebar
              </div>
            </div>
          </aside>
        </div>
      </div>
    </article>
  );
}