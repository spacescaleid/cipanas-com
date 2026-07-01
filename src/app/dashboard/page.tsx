// src/app/dashboard/page.tsx
import Link from "next/link";
import { PenSquare, FileText, Clock, CheckCircle2, Eye, AlertCircle } from "lucide-react";

import { requireRole } from "@/lib/auth-utils";
import { getContributorStats } from "@/lib/dashboard-queries";
import { formatCompactNumber } from "@/lib/format";

export default async function DashboardPage() {
  const session = await requireRole(["CONTRIBUTOR", "ADMIN", "SUPER_ADMIN"]);
  const stats = await getContributorStats(session.user.id);

  const cards = [
    {
      label: "Total Tulisan",
      value: stats.total,
      icon: FileText,
      color: "text-neutral-600 dark:text-neutral-400",
      bg: "bg-neutral-100 dark:bg-neutral-800",
    },
    {
      label: "Terpublikasi",
      value: stats.published,
      icon: CheckCircle2,
      color: "text-green-700 dark:text-green-400",
      bg: "bg-green-100 dark:bg-green-900/40",
    },
    {
      label: "Menunggu Review",
      value: stats.pending,
      icon: Clock,
      color: "text-amber-700 dark:text-amber-400",
      bg: "bg-amber-100 dark:bg-amber-900/40",
    },
    {
      label: "Perlu Revisi",
      value: stats.revision,
      icon: AlertCircle,
      color: "text-accent-700 dark:text-accent-400",
      bg: "bg-accent-100 dark:bg-accent-900/40",
    },
    {
      label: "Total Views",
      value: formatCompactNumber(stats.totalViews),
      icon: Eye,
      color: "text-brand-700 dark:text-brand-400",
      bg: "bg-brand-100 dark:bg-brand-900/40",
    },
  ];

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl font-bold text-neutral-900 dark:text-white">
            Selamat datang, {session.user.name} 👋
          </h1>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            Kelola tulisan Anda dan pantau performanya di sini.
          </p>
        </div>
        <Link
          href="/dashboard/tulis"
          className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
        >
          <PenSquare className="h-4 w-4" />
          Tulis Berita Baru
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div
              key={c.label}
              className="rounded-xl border border-neutral-200 bg-white p-5 shadow-card dark:border-neutral-800 dark:bg-neutral-900"
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg ${c.bg}`}
              >
                <Icon className={`h-5 w-5 ${c.color}`} />
              </div>
              <div className="mt-4 text-sm text-neutral-500">{c.label}</div>
              <div className="mt-1 text-2xl font-bold text-neutral-900 dark:text-white">
                {c.value}
              </div>
            </div>
          );
        })}
      </div>

      {stats.revision > 0 && (
        <div className="mt-6 rounded-xl border-l-4 border-accent-500 bg-accent-50 p-4 dark:bg-accent-900/20">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 text-accent-600 dark:text-accent-400" />
            <div>
              <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                Ada {stats.revision} artikel yang perlu direvisi
              </p>
              <Link
                href="/dashboard/tulisan?status=REVISION"
                className="mt-1 inline-block text-sm text-accent-700 hover:underline dark:text-accent-300"
              >
                Lihat sekarang →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}