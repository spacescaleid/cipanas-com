// src/app/dashboard/tulis/[id]/page.tsx
import { notFound } from "next/navigation";

import { requireRole } from "@/lib/auth-utils";
import { getAllCategories } from "@/lib/articles";
import { getMyArticleById } from "@/lib/dashboard-queries";
import { ArticleForm } from "@/components/dashboard/ArticleForm";
import { prisma } from "@/lib/prisma";

export default async function EditTulisPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireRole(["CONTRIBUTOR", "ADMIN", "SUPER_ADMIN"]);
  const { id } = await params;

  const [article, categories, galleryImages] = await Promise.all([
    getMyArticleById(session.user.id, id),
    getAllCategories(),
    prisma.articleImage.findMany({
      where: { articleId: id },
      orderBy: { order: "asc" },
      select: { id: true, url: true, title: true, caption: true },
    }),
  ]);

  if (!article) notFound();

  if (article.status === "PUBLISHED") {
    return (
      <div className="rounded-xl border border-amber-300 bg-amber-50 p-8 text-center dark:border-amber-800 dark:bg-amber-900/20">
        <h1 className="font-serif text-xl font-bold text-amber-900 dark:text-amber-200">
          Artikel Sudah Tayang
        </h1>
        <p className="mt-2 text-sm text-amber-800 dark:text-amber-300">
          Artikel yang sudah dipublikasikan tidak dapat diedit oleh kontributor.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-3xl font-bold text-neutral-900 dark:text-white">
          Edit Berita
        </h1>
        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
          Perbarui konten berita Anda
        </p>
      </div>

      <ArticleForm
        categories={categories}
        initialData={{
          id: article.id,
          title: article.title,
          content: article.content,
          coverImage: article.coverImage,
          categoryId: article.categoryId,
          status: article.status,
          revisionNote: article.revisionNote,
        }}
        initialGallery={galleryImages}
      />
    </div>
  );
}