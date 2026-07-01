// src/components/admin/AdminStatsCards.tsx
import {
  FileText,
  Users,
  Clock,
  Megaphone,
  Eye,
  DollarSign,
} from "lucide-react";
import Link from "next/link";

import { formatCompactNumber, formatRupiah } from "@/lib/format";

interface Props {
  stats: {
    totalArticles: number;
    publishedArticles: number;
    pendingArticles: number;
    revisionArticles: number;
    totalContributors: number;
    activeAds: number;
    totalViews: number;
    totalRevenue: number;
  };
}

export function AdminStatsCards({ stats }: Props) {
  const cards = [
    {
      label: "Total Artikel",
      value: stats.totalArticles,
      sublabel: `${stats.publishedArticles} tayang`,
      icon: FileText,
      color: "text-brand-700 dark:text-brand-400",
      bg: "bg-brand-100 dark:bg-brand-900/40",
      href: "/admin/berita",
    },
    {
      label: "Menunggu Review",
      value: stats.pendingArticles,
      sublabel:
        stats.pendingArticles > 0 ? "Perlu tindakan" : "Semua sudah direview",
      icon: Clock,
      color: "text-amber-700 dark:text-amber-400",
      bg: "bg-amber-100 dark:bg-amber-900/40",
      href: "/admin/berita?status=PENDING",
      highlight: stats.pendingArticles > 0,
    },
    {
      label: "Kontributor",
      value: stats.totalContributors,
      sublabel: "penulis aktif",
      icon: Users,
      color: "text-purple-700 dark:text-purple-400",
      bg: "bg-purple-100 dark:bg-purple-900/40",
      href: "/admin/pengguna",
    },
    {
      label: "Total Views",
      value: formatCompactNumber(stats.totalViews),
      sublabel: "seluruh artikel",
      icon: Eye,
      color: "text-green-700 dark:text-green-400",
      bg: "bg-green-100 dark:bg-green-900/40",
      href: null,
    },
    {
      label: "Iklan Aktif",
      value: stats.activeAds,
      sublabel: "sedang tayang",
      icon: Megaphone,
      color: "text-accent-700 dark:text-accent-400",
      bg: "bg-accent-100 dark:bg-accent-900/40",
      href: "/admin/iklan",
    },
    {
      label: "Total Pendapatan",
      value: formatRupiah(stats.totalRevenue),
      sublabel: "dari iklan",
      icon: DollarSign,
      color: "text-emerald-700 dark:text-emerald-400",
      bg: "bg-emerald-100 dark:bg-emerald-900/40",
      href: "/admin/iklan",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((c) => {
        const Icon = c.icon;
        const content = (
          <div
            className={`rounded-xl border bg-white p-5 shadow-card transition dark:bg-neutral-900 ${
              c.highlight
                ? "border-amber-400 dark:border-amber-700"
                : "border-neutral-200 dark:border-neutral-800"
            } ${c.href ? "hover:shadow-card-hover" : ""}`}
          >
            <div className="flex items-start justify-between">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg ${c.bg}`}
              >
                <Icon className={`h-5 w-5 ${c.color}`} />
              </div>
              {c.highlight && (
                <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white animate-pulse">
                  BARU
                </span>
              )}
            </div>
            <div className="mt-4 text-sm text-neutral-500">{c.label}</div>
            <div className="mt-1 text-2xl font-bold text-neutral-900 dark:text-white">
              {c.value}
            </div>
            <div className="mt-0.5 text-xs text-neutral-500">{c.sublabel}</div>
          </div>
        );

        return c.href ? (
          <Link key={c.label} href={c.href}>
            {content}
          </Link>
        ) : (
          <div key={c.label}>{content}</div>
        );
      })}
    </div>
  );
}