// src/app/dashboard/tulis/page.tsx
import { requireRole } from "@/lib/auth-utils";
import { getAllCategories } from "@/lib/articles";
import { ArticleForm } from "@/components/dashboard/ArticleForm";

export default async function TulisPage() {
  await requireRole(["CONTRIBUTOR", "ADMIN", "SUPER_ADMIN"]);
  const categories = await getAllCategories();

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-3xl font-bold text-neutral-900 dark:text-white">
          Tulis Berita Baru
        </h1>
        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
          Tulis dan publikasikan berita untuk pembaca Cipanas.com
        </p>
      </div>

      <ArticleForm categories={categories} />
    </div>
  );
}