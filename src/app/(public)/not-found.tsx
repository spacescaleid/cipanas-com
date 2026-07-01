// src/app/(public)/not-found.tsx
import Link from "next/link";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 py-20 text-center">
      <div className="font-serif text-8xl font-bold text-brand-600 dark:text-brand-400">
        404
      </div>
      <h1 className="mt-4 font-serif text-3xl font-bold text-neutral-900 dark:text-white">
        Halaman Tidak Ditemukan
      </h1>
      <p className="mt-3 text-neutral-600 dark:text-neutral-400">
        Halaman yang kamu cari mungkin sudah dihapus, dipindah, atau tidak pernah
        ada.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
        >
          <Home className="h-4 w-4" />
          Kembali ke Beranda
        </Link>
        <Link
          href="/cari"
          className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
        >
          <Search className="h-4 w-4" />
          Cari Berita
        </Link>
      </div>
    </div>
  );
}