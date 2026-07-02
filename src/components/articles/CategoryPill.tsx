// src/components/articles/CategoryPill.tsx

import Link from "next/link";

interface CategoryPillProps {
  name: string;
  slug: string;
  count?: number;
}

export function CategoryPill({ name, slug, count }: CategoryPillProps) {
  return (
    <Link
      href={`/kategori/${slug}`}
      className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-medium text-neutral-700 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700 transition-colors dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:border-blue-400 dark:hover:bg-blue-900/20 dark:hover:text-blue-300"
    >
      {name}
      {count !== undefined && count > 0 && (
        <span className="rounded-full bg-neutral-100 px-1.5 text-[10px] font-bold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
          {count}
        </span>
      )}
    </Link>
  );
}