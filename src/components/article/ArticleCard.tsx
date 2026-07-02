// src/components/article/ArticleCard.tsx
import Link from "next/link";
import Image from "next/image";
import { Clock, Eye, User } from "lucide-react";

import { CategoryBadge } from "@/components/ui/CategoryBadge";
import {
  estimateReadingTime,
  formatRelativeTime,
  formatCompactNumber,
} from "@/lib/format";

/**
 * Interface fleksibel untuk ArticleCard.
 * Support 2 skenario:
 * 1. Full article (dari ArticleWithRelations) — punya content, viewCount, createdAt, author
 * 2. Minimal article (dari homepage) — cuma title, slug, coverImage, category, publishedAt, author
 */
interface ArticleCardData {
  id: string;
  title: string;
  slug: string;
  coverImage: string | null;
  publishedAt: Date | string | null;
  createdAt?: Date | string;
  content?: string;
  viewCount?: number;
  author: {
    name: string;
    id?: string;
  };
  category: {
    name: string;
    slug: string;
    id?: string;
  };
}

interface Props {
  article: ArticleCardData;
}

export function ArticleCard({ article }: Props) {
  // Kalau ada content, hitung reading time. Kalau tidak, skip.
  const readingTime = article.content
    ? estimateReadingTime(article.content)
    : null;

  // Fallback ke createdAt kalau publishedAt tidak ada
  const displayDate = article.publishedAt ?? article.createdAt ?? null;

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-card transition hover:shadow-card-hover dark:border-neutral-800 dark:bg-neutral-900">
      <Link
        href={`/berita/${article.slug}`}
        className="relative block aspect-[16/9] overflow-hidden bg-neutral-100 dark:bg-neutral-800"
      >
        {article.coverImage ? (
          <Image
            src={article.coverImage}
            alt={article.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-neutral-400">
            <svg
              className="h-12 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-center gap-2">
          <CategoryBadge
            name={article.category.name}
            slug={article.category.slug}
          />
        </div>

        <Link href={`/berita/${article.slug}`}>
          <h3 className="line-clamp-2 font-serif text-lg font-bold leading-tight text-neutral-900 transition group-hover:text-brand-700 dark:text-white dark:group-hover:text-brand-400">
            {article.title}
          </h3>
        </Link>

        <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-500 dark:text-neutral-400">
          {/* Author (opsional) */}
          {article.author?.name && (
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {article.author.name}
            </span>
          )}

          {/* Tanggal */}
          {displayDate && <span>{formatRelativeTime(displayDate)}</span>}

          {/* Reading time (kalau ada content) */}
          {readingTime !== null && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {readingTime} mnt
            </span>
          )}

          {/* View count (kalau ada) */}
          {typeof article.viewCount === "number" && (
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {formatCompactNumber(article.viewCount)}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}