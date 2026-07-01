// src/components/layout/PublicNavbar.tsx
import Link from "next/link";
import { Search } from "lucide-react";

import { UserMenu } from "./UserMenu";
import { ThemeToggle } from "./ThemeToggle";
import { getAllCategories } from "@/lib/articles";

export async function PublicNavbar() {
  const categories = await getAllCategories();

  return (
    <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/95 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/95">
      <div className="border-b border-neutral-100 dark:border-neutral-800">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-baseline gap-1">
            <span className="font-serif text-2xl font-bold text-brand-700 dark:text-brand-400 md:text-3xl">
              Cipanas
            </span>
            <span className="font-serif text-2xl font-bold text-accent-500 md:text-3xl">
              .com
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/cari"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
              aria-label="Cari"
            >
              <Search className="h-4 w-4" />
            </Link>
            <ThemeToggle />
            <div className="ml-1">
              <UserMenu />
            </div>
          </div>
        </div>
      </div>

      <nav className="mx-auto max-w-7xl overflow-x-auto px-4">
        <ul className="flex items-center gap-1 whitespace-nowrap py-2 text-sm font-medium">
          <li>
            <Link
              href="/"
              className="rounded px-3 py-1.5 text-neutral-700 hover:bg-brand-50 hover:text-brand-700 dark:text-neutral-300 dark:hover:bg-brand-900/30 dark:hover:text-brand-400"
            >
              Beranda
            </Link>
          </li>
          {categories.map((cat) => (
            <li key={cat.id}>
              <Link
                href={`/kategori/${cat.slug}`}
                className="rounded px-3 py-1.5 text-neutral-700 hover:bg-brand-50 hover:text-brand-700 dark:text-neutral-300 dark:hover:bg-brand-900/30 dark:hover:text-brand-400"
              >
                {cat.name}
              </Link>
            </li>
          ))}
          <li>
            <Link
              href="/video"
              className="rounded px-3 py-1.5 text-neutral-700 hover:bg-brand-50 hover:text-brand-700 dark:text-neutral-300 dark:hover:bg-brand-900/30 dark:hover:text-brand-400"
            >
              Video
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}