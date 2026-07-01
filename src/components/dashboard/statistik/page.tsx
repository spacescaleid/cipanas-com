// src/app/dashboard/statistik/page.tsx
import Link from "next/link";
import { Eye, TrendingUp } from "lucide-react";

import { requireRole } from "@/lib/auth-utils";
import {
  getContributorStats,
  getMyTopArticles,
  getViewsByCategory,
  getPublishedByMonth,
} from "@/lib/dashboard-queries";
import { formatCompactNumber } from "@/lib/format";
import { StatsCharts } from "@/components/dashboard/StatsCharts";

export default async function StatistikPage() {
  const session = await requireRole([
    "CONTRIBUTOR",
    "ADMIN",
    "SUPER_ADMIN",
  ]);

  const [stats, topArticles, byCategory, monthly] = await Promise.all([
    getContributorStats(session.user.id),
    getMyTopArticles(session.user.id, 5),
    getViewsByCategory(session.user.id),
    getPublishedByMonth(session.user.id),
  ]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-3xl font-bold text-neutral-900 dark:text-white">
          Statistik
        </h1>
        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
          Pantau performa tulisan Anda di Cipanas.com
        </p>
      </div>

      {/* Overview cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
          <div className="text-sm text-neutral-500">Total Terpublikasi</div>
          <div className="mt-2 font-serif text-3xl font-bold text-neutral-900 dark:text-white">
            {stats.published}
          </div>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
          <div className="text-sm text-neutral-500">Total Views</div>
          <div className="mt-2 font-serif text-3xl font-bold text-brand-700 dark:text-brand-400">
            {formatCompactNumber(stats.totalViews)}
          </div>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
          <div className="text-sm text-neutral-500">Rata-rata Views/Artikel</div>
          <div className="mt-2 font-serif text-3xl font-bold text-neutral-900 dark:text-white">
            {stats.published > 0
              ? formatCompactNumber(Math.round(stats.totalViews / stats.published))
              : 0}
          </div>
        </div>
      </div>

      {/* Charts */}
      {stats.published > 0 ? (
        <StatsCharts monthly={monthly} byCategory={byCategory} />
      ) : (
        <div className="rounded-xl border border-dashed border-neutral-300 p-12 text-center dark:border-neutral-700">
          <TrendingUp className="mx-auto h-12 w-12 text-neutral-400" />
          <p className="mt-4 text-neutral-600 dark:text-neutral-400">
            Belum ada artikel yang dipublikasikan. Chart akan muncul setelah artikel Anda tayang.
          </p>
        </div>
      )}

      {/* Top articles */}
      {topArticles.length > 0 && (
        <div className="mt-8 rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
          <h3 className="mb-1 font-serif text-lg font-bold text-neutral-900 dark:text-white">
            Artikel Terpopuler
          </h3>
          <p className="mb-4 text-xs text-neutral-500">
            Berdasarkan jumlah views
          </p>

          <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {topArticles.map((article, index) => (
              <div key={article.id} className="flex items-center gap-3 py-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-50 font-serif text-sm font-bold text-brand-700 dark:bg-brand-900/40 dark:text-brand-400">
                  {index + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/berita/${article.slug}`}
                    target="_blank"
                    className="line-clamp-1 text-sm font-semibold text-neutral-900 hover:text-brand-700 dark:text-white dark:hover:text-brand-400"
                  >
                    {article.title}
                  </Link>
                  <div className="text-xs text-neutral-500">
                    {article.category.name}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                  <Eye className="h-3.5 w-3.5" />
                  {formatCompactNumber(article.viewCount)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}