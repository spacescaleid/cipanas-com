// src/components/article/ArticleContent.tsx
import { cn } from "@/lib/utils";

interface Props {
  html: string;
  className?: string;
}

/**
 * Render HTML artikel dengan typography yang enak dibaca.
 * Semua styling per-element pakai class inline supaya tidak
 * butuh @tailwindcss/typography.
 */
export function ArticleContent({ html, className }: Props) {
  return (
    <div
      className={cn(
        "article-content font-serif text-lg leading-relaxed text-neutral-800 dark:text-neutral-200",
        className
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}