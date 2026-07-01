// src/app/admin/berita/page.tsx
import Link from "next/link";
import Image from "next/image";
import { FileX, Eye } from "lucide-react";
import type { ArticleStatus } from "@prisma/client";

import { requireRole } from "@/lib/auth-utils";
import {
  getAdminArticles,
  getAdminArticleCounts,
} from "@/lib/admin-queries";
import { ArticleFilterBar } from "@/components/admin/ArticleFilterBar";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { formatRelativeTime, formatCompactNumber } from "@/lib/format";

type FilterKey =
  | "ALL"
  | "PENDING"
  | "REVISION"
  | "PUBLISHED"
  | "REJECTED"
  | "DRAFT";

const VALID: FilterKey[] = [
  "ALL",
  "PENDING",
  "REVISION",
  "PUBLISHED",
  "REJECTED",
  "DRAFT",
];

function parseFilter(raw?: string): FilterKey {
  if (!raw) return "PENDING"; // default: tampilkan yang perlu direview
  const upper = raw.toUpperCase() as FilterKey;
  return VALID.includes(upper) ? upper : "PENDING";
}

export default async function AdminBeritaPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireRole(["ADMIN", "SUPER_ADMIN"]);
  const sp = await searchParams;
  const filter = parseFilter(sp.status);

  const [articles, counts] = await Promise.all([
    getAdminArticles(
      filter === "ALL" ? undefined : (filter as ArticleStatus)
    ),
    getAdminArticleCounts(),
  ]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-3xl font-bold text-neutral-900 dark:text-white">
          Kelola Berita
        </h1>
        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
          Review, setujui, atau minta revisi artikel dari kontributor.
        </p>
      </div>

      <ArticleFilterBar current={filter} counts={counts} />

      <div className="mt-6 space-y-3">
        {articles.length === 0 ? (
          <div className="rounded-xl border border-dashed border-neutral-300 py-16 text-center dark:border-neutral-700">
            <FileX className="mx-auto h-12 w-12 text-neutral-400" />
            <p className="mt-4 text-neutral-600 dark:text-neutral-400">
              Tidak ada artikel dengan status ini.
            </p>
          </div>
        ) : (
          articles.map((article) => (
            <Link
              key={article.id}
              href={`/admin/berita/${article.id}`}
              className="flex gap-4 rounded-xl border border-neutral-200 bg-white p-4 transition hover:shadow-card dark:border-neutral-800 dark:bg-neutral-900"
            >
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

                <div className="mt-auto flex flex-wrap items-center gap-3 pt-2 text-xs text-neutral-500">
                  <span>oleh {article.author.name}</span>
                  <span>•</span>
                  <span>{formatRelativeTime(article.updatedAt)}</span>
                  {article.status === "PUBLISHED" && (
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {formatCompactNumber(article.viewCount)}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}