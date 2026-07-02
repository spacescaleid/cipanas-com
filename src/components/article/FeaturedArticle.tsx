// src/components/articles/FeaturedArticle.tsx

import Link from "next/link";
import Image from "next/image";
import { Clock, User, ArrowRight } from "lucide-react";
import { formatRelativeTime } from "@/lib/format";

interface FeaturedArticleProps {
  article: {
    id: string;
    title: string;
    slug: string;
    content: string;
    coverImage: string | null;
    publishedAt: Date | string | null;
    author: { name: string };
    category: { name: string; slug: string };
  };
}

export function FeaturedArticle({ article }: FeaturedArticleProps) {
  // Extract excerpt dari content (150 karakter pertama tanpa HTML tag)
  const excerpt = article.content
    .replace(/<[^>]+>/g, "")
    .slice(0, 200)
    .trim() + "...";

  return (
    <div className="grid grid-cols-1 gap-6 overflow-hidden rounded-2xl border border-neutral-200 bg-white lg:grid-cols-2 dark:border-neutral-800 dark:bg-neutral-900">
      {/* Cover Image */}
      <Link
        href={`/berita/${article.slug}`}
        className="relative aspect-[16/10] overflow-hidden bg-neutral-100 lg:aspect-auto dark:bg-neutral-800"
      >
        {article.coverImage ? (
          <Image
            src={article.coverImage}
            alt={article.title}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover transition-transform duration-500 hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-neutral-400">
            <span>No Image</span>
          </div>
        )}

        <div className="absolute left-4 top-4">
          <span className="inline-flex items-center rounded-lg bg-blue-600 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-lg">
            📌 Sorotan
          </span>
        </div>
      </Link>

      {/* Content */}
      <div className="flex flex-col justify-center p-6 lg:p-8">
        <Link
          href={`/kategori/${article.category.slug}`}
          className="mb-3 inline-flex w-fit items-center rounded-md bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 dark:bg-blue-900/40 dark:text-blue-300"
        >
          {article.category.name}
        </Link>

        <Link
          href={`/berita/${article.slug}`}
          className="mb-3 font-serif text-2xl font-bold leading-tight text-neutral-900 hover:text-blue-600 lg:text-3xl dark:text-white dark:hover:text-blue-400"
        >
          {article.title}
        </Link>

        <p className="mb-4 line-clamp-3 text-sm text-neutral-600 dark:text-neutral-400">
          {excerpt}
        </p>

        <div className="mb-5 flex items-center gap-4 text-xs text-neutral-500">
          <span className="inline-flex items-center gap-1.5">
            <User className="h-3.5 w-3.5" />
            {article.author.name}
          </span>
          {article.publishedAt && (
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {formatRelativeTime(article.publishedAt)}
            </span>
          )}
        </div>

        <Link
          href={`/berita/${article.slug}`}
          className="inline-flex w-fit items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Baca Selengkapnya
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}