// src/components/article/RelatedArticles.tsx
import Link from "next/link";
import Image from "next/image";

import { getRelatedArticles } from "@/lib/articles";
import { formatRelativeTime } from "@/lib/format";

interface Props {
  articleId: string;
  categoryId: string;
}

export async function RelatedArticles({ articleId, categoryId }: Props) {
  const articles = await getRelatedArticles(articleId, categoryId, 3);

  if (articles.length === 0) return null;

  return (
    <section className="mt-16 border-t border-neutral-200 pt-10 dark:border-neutral-800">
      <h2 className="mb-6 font-serif text-2xl font-bold text-neutral-900 dark:text-white">
        Berita Terkait
      </h2>

      <div className="grid gap-6 sm:grid-cols-3">
        {articles.map((article) => (
          <Link
            key={article.id}
            href={`/berita/${article.slug}`}
            className="group block"
          >
            <div className="relative aspect-[16/10] overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-800">
              {article.coverImage && (
                <Image
                  src={article.coverImage}
                  alt={article.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
              )}
            </div>
            <div className="mt-3">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                {article.category.name}
              </div>
              <h3 className="mt-1 line-clamp-2 font-serif text-base font-bold leading-snug text-neutral-900 transition group-hover:text-brand-700 dark:text-white dark:group-hover:text-brand-400">
                {article.title}
              </h3>
              <div className="mt-2 text-xs text-neutral-500">
                {formatRelativeTime(article.publishedAt ?? article.createdAt)}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}