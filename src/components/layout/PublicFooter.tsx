// src/components/layout/PublicFooter.tsx
import Link from "next/link";

export function PublicFooter() {
  return (
    <footer className="mt-16 border-t border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-baseline gap-1">
              <span className="font-serif text-2xl font-bold text-brand-700 dark:text-brand-400">
                Cipanas
              </span>
              <span className="font-serif text-2xl font-bold text-accent-500">
                .com
              </span>
            </Link>
            <p className="mt-3 max-w-md text-sm text-neutral-600 dark:text-neutral-400">
              Portal berita terkini seputar Cipanas, Cianjur, dan sekitarnya.
              Menyajikan informasi terpercaya seputar politik, ekonomi, olahraga,
              hiburan, dan gaya hidup.
            </p>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
              Navigasi
            </h4>
            <ul className="space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
              <li><Link href="/" className="hover:text-brand-600">Beranda</Link></li>
              <li><Link href="/video" className="hover:text-brand-600">Video</Link></li>
              <li><Link href="/cari" className="hover:text-brand-600">Cari Berita</Link></li>
              <li><Link href="/tentang" className="hover:text-brand-600">Tentang</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
              Bisnis
            </h4>
            <ul className="space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
              <li><Link href="/pasang-iklan" className="hover:text-brand-600">Pasang Iklan</Link></li>
              <li><Link href="/kontak" className="hover:text-brand-600">Kontak</Link></li>
              <li><Link href="/register" className="hover:text-brand-600">Jadi Kontributor</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-neutral-200 pt-6 text-center text-xs text-neutral-500 dark:border-neutral-800">
          © {new Date().getFullYear()} Cipanas.com — All rights reserved.
        </div>
      </div>
    </footer>
  );
}