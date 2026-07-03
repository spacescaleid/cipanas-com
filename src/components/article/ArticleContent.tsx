// src/components/article/ArticleContent.tsx
import { cn } from "@/lib/utils";
import { sanitizeArticleHtml } from "@/lib/sanitize";

interface Props {
  html: string;
  className?: string;
}

/**
 * Render HTML artikel dengan typography yang enak dibaca.
 * HTML di-sanitasi dulu untuk cegah XSS (pertahanan terakhir).
 * Semua styling per-element pakai class inline supaya tidak
 * butuh @tailwindcss/typography.
 */
export function ArticleContent({ html, className }: Props) {
  // Sanitasi HTML sebelum render — pertahanan terakhir terhadap XSS
  const safeHtml = sanitizeArticleHtml(html);

  return (
    <div
      className={cn(
        "article-content font-serif text-lg leading-relaxed text-neutral-800 dark:text-neutral-200",
        className
      )}
      dangerouslySetInnerHTML={{ __html: safeHtml }}
    />
  );
}