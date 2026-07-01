// src/app/dashboard/tulisan/page.tsx
import Link from "next/link";
import { PenSquare, FileX } from "lucide-react";
import type { ArticleStatus } from "@prisma/client";

import { requireRole } from "@/lib/auth-utils";
import {
  getMyArticlesFiltered,
  getMyArticleCounts,
} from "@/lib/dashboard-queries";
import { ArticleListItem } from "@/components/dashboard/ArticleListItem";
import { ArticleStatusFilter } from "@/components/dashboard/ArticleStatusFilter";

type FilterKey =
  | "ALL"
  | "DRAFT"
  | "PENDING"
  | "REVISION"
  | "PUBLISHED"
  | "REJECTED";

const VALID_FILTERS: FilterKey[] = [
  "ALL",
  "DRAFT",
  "PENDING",
  "REVISION",
  "PUBLISHED",
  "REJECTED",
];

function parseFilter(raw?: string): FilterKey {
  if (!raw) return "ALL";
  const upper = raw.toUpperCase() as FilterKey;
  return VALID_FILTERS.includes(upper) ? upper : "ALL";
}

export default async function TulisanSayaPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const session = await requireRole([
    "CONTRIBUTOR",
    "ADMIN",
    "SUPER_ADMIN",
  ]);

  const sp = await searchParams;
  const filter = parseFilter(sp.status);

  const [articles, counts] = await Promise.all([
    getMyArticlesFiltered(
      session.user.id,
      filter === "ALL" ? undefined : (filter as ArticleStatus)
    ),
    getMyArticleCounts(session.user.id),
  ]);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl font-bold text-neutral-900 dark:text-white">
            Tulisan Saya
          </h1>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            Kelola semua tulisan yang pernah Anda buat.
          </p>
        </div>
        <Link
          href="/dashboard/tulis"
          className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
        >
          <PenSquare className="h-4 w-4" />
          Tulis Baru
        </Link>
      </div>

      <ArticleStatusFilter current={filter} counts={counts} />

      <div className="mt-6 space-y-3">
        {articles.length === 0 ? (
          <div className="rounded-xl border border-dashed border-neutral-300 py-16 text-center dark:border-neutral-700">
            <FileX className="mx-auto h-12 w-12 text-neutral-400" />
            <p className="mt-4 text-neutral-600 dark:text-neutral-400">
              {filter === "ALL"
                ? "Belum ada tulisan. Mulai menulis sekarang!"
                : "Tidak ada tulisan dengan status ini."}
            </p>
            {filter === "ALL" && (
              <Link
                href="/dashboard/tulis"
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
              >
                <PenSquare className="h-4 w-4" />
                Tulis Berita Pertama
              </Link>
            )}
          </div>
        ) : (
          articles.map((article) => (
            <ArticleListItem key={article.id} article={article} />
          ))
        )}
      </div>
    </div>
  );
}