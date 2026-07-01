// src/components/ui/CategoryBadge.tsx
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Props {
  name: string;
  slug: string;
  className?: string;
  size?: "sm" | "md";
}

export function CategoryBadge({ name, slug, className, size = "sm" }: Props) {
  return (
    <Link
      href={`/kategori/${slug}`}
      className={cn(
        "inline-flex items-center rounded-full font-semibold uppercase tracking-wider transition hover:opacity-80",
        "bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300",
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-3 py-1 text-xs",
        className
      )}
    >
      {name}
    </Link>
  );
}