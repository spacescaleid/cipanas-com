// src/components/dashboard/NotificationTimeline.tsx
import Link from "next/link";
import type { ArticleStatus } from "@prisma/client";
import { CheckCircle2, AlertCircle, XCircle, ExternalLink } from "lucide-react";

import { formatRelativeTime } from "@/lib/format";

interface Notification {
  id: string;
  title: string;
  slug: string;
  status: ArticleStatus;
  revisionNote: string | null;
  updatedAt: Date;
  publishedAt: Date | null;
}

interface Props {
  notifications: Notification[];
}

const iconMap: Record<
  string,
  { icon: typeof CheckCircle2; bg: string; color: string; text: string }
> = {
  PUBLISHED: {
    icon: CheckCircle2,
    bg: "bg-green-100 dark:bg-green-900/40",
    color: "text-green-700 dark:text-green-400",
    text: "Artikel Anda telah dipublikasikan",
  },
  REVISION: {
    icon: AlertCircle,
    bg: "bg-accent-100 dark:bg-accent-900/40",
    color: "text-accent-700 dark:text-accent-400",
    text: "Admin meminta revisi pada artikel Anda",
  },
  REJECTED: {
    icon: XCircle,
    bg: "bg-red-100 dark:bg-red-900/40",
    color: "text-red-700 dark:text-red-400",
    text: "Artikel Anda ditolak",
  },
};

export function NotificationTimeline({ notifications }: Props) {
  if (notifications.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-neutral-300 py-16 text-center dark:border-neutral-700">
        <p className="text-neutral-600 dark:text-neutral-400">
          Belum ada notifikasi.
        </p>
        <p className="mt-1 text-xs text-neutral-500">
          Notifikasi akan muncul saat admin mereview artikel Anda.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {notifications.map((n) => {
        const cfg = iconMap[n.status];
        if (!cfg) return null;
        const Icon = cfg.icon;
        const isPublished = n.status === "PUBLISHED";

        return (
          <li
            key={n.id}
            className="flex gap-4 rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
          >
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${cfg.bg}`}
            >
              <Icon className={`h-5 w-5 ${cfg.color}`} />
            </div>

            <div className="min-w-0 flex-1">
              <div className="text-sm">
                <span className={cfg.color + " font-semibold"}>{cfg.text}</span>
              </div>

              <div className="mt-1 flex items-center gap-2">
                <p className="line-clamp-1 font-serif text-base font-bold text-neutral-900 dark:text-white">
                  {n.title}
                </p>
              </div>

              {n.revisionNote && (
                <div className="mt-2 rounded-lg border-l-4 border-accent-500 bg-accent-50 px-3 py-2 dark:bg-accent-900/20">
                  <div className="text-xs font-semibold uppercase tracking-wider text-accent-700 dark:text-accent-300">
                    Catatan Admin
                  </div>
                  <p className="mt-0.5 text-sm text-neutral-700 dark:text-neutral-300">
                    {n.revisionNote}
                  </p>
                </div>
              )}

              <div className="mt-2 flex items-center gap-3 text-xs text-neutral-500">
                <span>{formatRelativeTime(n.updatedAt)}</span>
                {isPublished ? (
                  <Link
                    href={`/berita/${n.slug}`}
                    target="_blank"
                    className="flex items-center gap-1 text-brand-600 hover:underline dark:text-brand-400"
                  >
                    Lihat artikel <ExternalLink className="h-3 w-3" />
                  </Link>
                ) : (
                  <Link
                    href={`/dashboard/tulis/${n.id}`}
                    className="text-brand-600 hover:underline dark:text-brand-400"
                  >
                    Buka & revisi →
                  </Link>
                )}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}