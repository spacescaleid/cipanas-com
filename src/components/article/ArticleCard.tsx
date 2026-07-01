// src/components/article/ArticleCard.tsx
import Link from "next/link";
import Image from "next/image";
import { Clock, Eye } from "lucide-react";

import { CategoryBadge } from "@/components/ui/CategoryBadge";
import {
  estimateReadingTime,
  formatRelativeTime,
  formatCompactNumber,
} from "@/lib/format";
import type { ArticleWithRelations } from "@/lib/articles";

interface Props {
  article: ArticleWithRelations;
}

export function ArticleCard({ article }: Props) {
  const readingTime = estimateReadingTime(article.content);

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-card transition hover:shadow-card-hover dark:border-neutral-800 dark:bg-neutral-900">
      <Link
        href={`/berita/${article.slug}`}
        className="relative block aspect-[16/9] overflow-hidden bg-neutral-100 dark:bg-neutral-800"
      >
        {article.coverImage && (
          <Image
            src={article.coverImage}
            alt={article.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
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
          <h3 className="font-serif text-lg font-bold leading-tight text-neutral-900 transition group-hover:text-brand-700 dark:text-white dark:group-hover:text-brand-400">
            {article.title}
          </h3>
        </Link>

        <div className="mt-auto flex items-center gap-4 text-xs text-neutral-500 dark:text-neutral-400">
          <span>{formatRelativeTime(article.publishedAt ?? article.createdAt)}</span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {readingTime} mnt
          </span>
          <span className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            {formatCompactNumber(article.viewCount)}
          </span>
        </div>
      </div>
    </article>
  );
}