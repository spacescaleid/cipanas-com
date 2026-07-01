// src/components/dashboard/ArticleListItem.tsx
import Link from "next/link";
import Image from "next/image";
import { Pencil, Eye, ExternalLink, Clock } from "lucide-react";
import type { ArticleStatus } from "@prisma/client";

import { StatusBadge } from "./StatusBadge";
import { DeleteArticleButton } from "./DeleteArticleButton";
import { formatRelativeTime, formatCompactNumber } from "@/lib/format";

interface Props {
  article: {
    id: string;
    title: string;
    slug: string;
    coverImage: string | null;
    status: ArticleStatus;
    viewCount: number;
    updatedAt: Date;
    revisionNote: string | null;
    category: { name: string; slug: string };
  };
}

export function ArticleListItem({ article }: Props) {
  const canEdit = article.status !== "PUBLISHED";
  const canDelete =
    article.status === "DRAFT" ||
    article.status === "REJECTED" ||
    article.status === "REVISION";

  return (
    <div className="flex gap-4 rounded-xl border border-neutral-200 bg-white p-4 transition hover:shadow-card dark:border-neutral-800 dark:bg-neutral-900">
      {/* Thumbnail */}
      <div className="relative h-24 w-32 shrink-0 overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-800 sm:h-28 sm:w-40">
        {article.coverImage ? (
          <Image
            src={article.coverImage}
            alt={article.title}
            fill
            sizes="160px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-neutral-400">
            Tanpa cover
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={article.status} />
          <span className="text-xs text-neutral-500">
            {article.category.name}
          </span>
        </div>

        <h3 className="mt-1.5 line-clamp-2 font-serif text-base font-bold leading-snug text-neutral-900 dark:text-white sm:text-lg">
          {article.title}
        </h3>

        {article.status === "REVISION" && article.revisionNote && (
          <p className="mt-1.5 line-clamp-2 rounded bg-accent-50 px-2 py-1 text-xs italic text-accent-800 dark:bg-accent-900/20 dark:text-accent-300">
            Catatan: {article.revisionNote}
          </p>
        )}

        <div className="mt-auto flex flex-wrap items-center gap-3 pt-2 text-xs text-neutral-500">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatRelativeTime(article.updatedAt)}
          </span>
          {article.status === "PUBLISHED" && (
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {formatCompactNumber(article.viewCount)} views
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col items-end gap-1">
        {article.status === "PUBLISHED" && (
          <Link
            href={`/berita/${article.slug}`}
            target="_blank"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-500 transition hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-900/30"
            aria-label="Lihat artikel"
          >
            <ExternalLink className="h-4 w-4" />
          </Link>
        )}
        {canEdit && (
          <Link
            href={`/dashboard/tulis/${article.id}`}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-500 transition hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-900/30"
            aria-label="Edit artikel"
          >
            <Pencil className="h-4 w-4" />
          </Link>
        )}
        {canDelete && (
          <DeleteArticleButton
            articleId={article.id}
            articleTitle={article.title}
          />
        )}
      </div>
    </div>
  );
}