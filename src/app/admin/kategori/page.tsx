// src/app/admin/kategori/page.tsx
import { requireRole } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { CategoryManager } from "@/components/admin/CategoryManager";

async function getCategoriesWithCount() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { articles: true } } },
  });

  return categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    articleCount: c._count.articles,
  }));
}

export default async function AdminKategoriPage() {
  await requireRole(["ADMIN", "SUPER_ADMIN"]);
  const categories = await getCategoriesWithCount();

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-3xl font-bold text-neutral-900 dark:text-white">
          Kelola Kategori
        </h1>
        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
          Tambah, edit, atau hapus kategori artikel. Total: {categories.length}{" "}
          kategori.
        </p>
      </div>

      <CategoryManager categories={categories} />
    </div>
  );
}