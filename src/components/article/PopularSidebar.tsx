// src/components/article/PopularSidebar.tsx
import Link from "next/link";
import { TrendingUp } from "lucide-react";

import { getPopularArticles } from "@/lib/articles";
import { formatCompactNumber } from "@/lib/format";

export async function PopularSidebar() {
  const articles = await getPopularArticles(5);

  return (
    <aside className="rounded-xl border border-neutral-200 bg-white p-5 shadow-card dark:border-neutral-800 dark:bg-neutral-900">
      <div className="mb-4 flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-brand-600" />
        <h3 className="font-serif text-lg font-bold text-neutral-900 dark:text-white">
          Terpopuler
        </h3>
      </div>

      <ol className="space-y-4">
        {articles.map((article, index) => (
          <li key={article.id} className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-50 font-serif text-lg font-bold text-brand-600 dark:bg-brand-900/40 dark:text-brand-400">
              {index + 1}
            </div>
            <div className="min-w-0 flex-1">
              <Link
                href={`/berita/${article.slug}`}
                className="line-clamp-2 text-sm font-semibold leading-snug text-neutral-800 transition hover:text-brand-700 dark:text-neutral-200 dark:hover:text-brand-400"
              >
                {article.title}
              </Link>
              <div className="mt-1 flex items-center gap-2 text-xs text-neutral-500">
                <span>{article.category.name}</span>
                <span>•</span>
                <span>{formatCompactNumber(article.viewCount)} views</span>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </aside>
  );
}