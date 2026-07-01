// src/components/article/ArticleCardLarge.tsx
import Link from "next/link";
import Image from "next/image";
import { Clock } from "lucide-react";

import { CategoryBadge } from "@/components/ui/CategoryBadge";
import { estimateReadingTime, formatRelativeTime } from "@/lib/format";
import type { ArticleWithRelations } from "@/lib/articles";

interface Props {
  article: ArticleWithRelations;
}

/** Card besar untuk headline / hero */
export function ArticleCardLarge({ article }: Props) {
  const readingTime = estimateReadingTime(article.content);

  return (
    <article className="group relative overflow-hidden rounded-2xl shadow-card">
      <Link
        href={`/berita/${article.slug}`}
        className="relative block aspect-[16/10] w-full overflow-hidden bg-neutral-200 dark:bg-neutral-800"
      >
        {article.coverImage && (
          <Image
            src={article.coverImage}
            alt={article.title}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 66vw"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
      </Link>

      <div className="absolute inset-x-0 bottom-0 z-10 p-6 md:p-8">
        <CategoryBadge
          name={article.category.name}
          slug={article.category.slug}
          size="md"
          className="mb-3 !bg-white/90 !text-brand-700"
        />
        <Link href={`/berita/${article.slug}`}>
          <h2 className="font-serif text-2xl font-bold leading-tight text-white transition hover:text-brand-200 md:text-4xl">
            {article.title}
          </h2>
        </Link>
        <div className="mt-3 flex items-center gap-4 text-xs text-white/80">
          <span>Oleh {article.author.name}</span>
          <span>•</span>
          <span>{formatRelativeTime(article.publishedAt ?? article.createdAt)}</span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {readingTime} mnt
          </span>
        </div>
      </div>
    </article>
  );
}