// src/app/admin/berita/[id]/page.tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, User as UserIcon, Calendar, Eye } from "lucide-react";

import { requireRole } from "@/lib/auth-utils";
import { getAdminArticleById } from "@/lib/admin-queries";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { ArticleContent } from "@/components/article/ArticleContent";
import { ArticleReviewActions } from "@/components/admin/ArticleReviewActions";
import { AdminArticleActions } from "@/components/admin/AdminArticleActions";
import {
  formatDate,
  formatCompactNumber,
  estimateReadingTime,
} from "@/lib/format";

export default async function AdminBeritaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(["ADMIN", "SUPER_ADMIN"]);
  const { id } = await params;

  const article = await getAdminArticleById(id);
  if (!article) notFound();

  const readingTime = estimateReadingTime(article.content);
  const isPending = article.status === "PENDING";

  return (
    <div>
      <Link
        href="/admin/berita"
        className="mb-4 inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-brand-600 dark:text-neutral-400"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke daftar
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Konten */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={article.status} />
              <span className="text-xs text-neutral-500">
                {article.category.name}
              </span>
            </div>

            <h1 className="mt-3 font-serif text-3xl font-bold leading-tight text-neutral-900 dark:text-white md:text-4xl">
              {article.title}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-4 border-y border-neutral-200 py-3 text-xs text-neutral-600 dark:border-neutral-800 dark:text-neutral-400">
              <span className="flex items-center gap-1.5">
                <UserIcon className="h-3.5 w-3.5" />
                {article.author.name}{" "}
                <span className="text-neutral-400">
                  ({article.author.email})
                </span>
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                {formatDate(article.updatedAt)}
              </span>
              <span>{readingTime} menit baca</span>
              {article.status === "PUBLISHED" && (
                <span className="flex items-center gap-1.5">
                  <Eye className="h-3.5 w-3.5" />
                  {formatCompactNumber(article.viewCount)} views
                </span>
              )}
            </div>

            {article.coverImage && (
              <div className="relative mt-6 aspect-[16/9] overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-800">
                <Image
                  src={article.coverImage}
                  alt={article.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  className="object-cover"
                />
              </div>
            )}

            <div className="mt-6">
              <ArticleContent html={article.content} />
            </div>

            {article.revisionNote && (
              <div className="mt-8 rounded-lg border-l-4 border-accent-500 bg-accent-50 p-4 dark:bg-accent-900/20">
                <div className="text-xs font-semibold uppercase tracking-wider text-accent-700 dark:text-accent-300">
                  Catatan Sebelumnya
                </div>
                <p className="mt-1 text-sm text-neutral-700 dark:text-neutral-300">
                  {article.revisionNote}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar aksi */}
        <div className="space-y-6">
          <div className="space-y-6 lg:sticky lg:top-24">
            {isPending ? (
              <ArticleReviewActions
                articleId={article.id}
                articleStatus={article.status}
              />
            ) : (
              <AdminArticleActions
                articleId={article.id}
                articleSlug={article.slug}
                articleTitle={article.title}
                articleStatus={article.status}
              />
            )}

            {/* Author info */}
            <div className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Info Kontributor
              </h3>
              <div className="flex items-center gap-3">
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-brand-100 dark:bg-brand-900/40">
                  {article.author.image ? (
                    <Image
                      src={article.author.image}
                      alt={article.author.name}
                      fill
                      sizes="40px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <UserIcon className="h-5 w-5 text-brand-600 dark:text-brand-400" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold text-neutral-900 dark:text-white">
                    {article.author.name}
                  </div>
                  <div className="truncate text-xs text-neutral-500">
                    {article.author.email}
                  </div>
                </div>
              </div>
              <div className="mt-3 inline-block rounded bg-brand-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
                {article.author.role}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}