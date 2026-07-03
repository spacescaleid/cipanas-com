// src/components/articles/ArticleCard.tsx

import Link from "next/link";
import Image from "next/image";
import { Clock, User } from "lucide-react";
import { formatRelativeTime } from "@/lib/format";

interface ArticleCardProps {
  article: {
    id: string;
    title: string;
    slug: string;
    coverImage: string | null;
    publishedAt: Date | string | null;
    author: { name: string };
    category: { name: string; slug: string };
  };
}

export function ArticleCard({ article }: ArticleCardProps) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white transition-all hover:shadow-lg dark:border-neutral-800 dark:bg-neutral-900">
      {/* Cover Image — fixed aspect ratio biar seragam */}
      <Link
        href={`/berita/${article.slug}`}
        className="relative block aspect-[16/10] overflow-hidden bg-neutral-100 dark:bg-neutral-800"
      >
        {article.coverImage ? (
          <Image
            src={article.coverImage}
            alt={article.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
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

        {/* Category Badge */}
        <div className="absolute left-3 top-3">
          <span className="inline-flex items-center rounded-md bg-blue-600 px-2 py-0.5 text-xs font-semibold text-white shadow">
            {article.category.name}
          </span>
        </div>
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        <Link
          href={`/berita/${article.slug}`}
          className="mb-2 line-clamp-2 font-serif text-base font-bold leading-tight text-neutral-900 hover:text-blue-600 dark:text-white dark:hover:text-blue-400"
        >
          {article.title}
        </Link>

        {/* Meta */}
        <div className="mt-auto flex items-center gap-3 pt-2 text-xs text-neutral-500">
          <span className="inline-flex items-center gap-1">
            <User className="h-3 w-3" />
            {article.author.name}
          </span>
          {article.publishedAt && (
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatRelativeTime(article.publishedAt)}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}