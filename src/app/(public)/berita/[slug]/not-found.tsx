// src/app/(public)/berita/[slug]/not-found.tsx
import Link from "next/link";
import { FileQuestion } from "lucide-react";

export default function ArticleNotFound() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-20 text-center">
      <FileQuestion className="h-16 w-16 text-neutral-400" />
      <h1 className="mt-6 font-serif text-3xl font-bold text-neutral-900 dark:text-white">
        Artikel Tidak Ditemukan
      </h1>
      <p className="mt-3 text-neutral-600 dark:text-neutral-400">
        Berita yang kamu cari mungkin sudah dihapus atau belum dipublikasikan.
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