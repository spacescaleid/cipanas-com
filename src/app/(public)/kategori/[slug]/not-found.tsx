// src/app/(public)/kategori/[slug]/not-found.tsx
import Link from "next/link";
import { FolderX } from "lucide-react";

export default function CategoryNotFound() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-20 text-center">
      <FolderX className="h-16 w-16 text-neutral-400" />
      <h1 className="mt-6 font-serif text-3xl font-bold text-neutral-900 dark:text-white">
        Kategori Tidak Ditemukan
      </h1>
      <p className="mt-3 text-neutral-600 dark:text-neutral-400">
        Kategori yang kamu cari tidak tersedia.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
      >
        Kembali ke Beranda
      </Link>
    </div>
  );
}