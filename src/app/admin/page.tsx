// src/app/admin/page.tsx
import Link from "next/link";
import { ArrowRight, Activity, Clock } from "lucide-react";

import { requireRole } from "@/lib/auth-utils";
import {
    getAdminStats,
    getPublishedArticlesByMonth,
    getArticleCountByCategory,
    getRecentActivities,
} from "@/lib/admin-queries";
import { AdminStatsCards } from "@/components/admin/AdminStatsCards";
import { AdminOverviewCharts } from "@/components/admin/AdminOverviewCharts";
import { formatRelativeTime } from "@/lib/format";
import { RunCronButton } from "@/components/admin/RunCronButton";

const actionLabels: Record<string, string> = {
    // Article actions
    APPROVE_ARTICLE: "menyetujui artikel",
    REJECT_ARTICLE: "menolak artikel",
    REQUEST_REVISION: "meminta revisi artikel",
    UNPUBLISH_ARTICLE: "menurunkan artikel",
    DELETE_ARTICLE: "menghapus artikel",
    // Category actions
    CREATE_CATEGORY: "membuat kategori",
    UPDATE_CATEGORY: "mengubah kategori",
    DELETE_CATEGORY: "menghapus kategori",
    // User actions
    CHANGE_USER_ROLE: "mengubah role user",
    DELETE_USER: "menghapus user",
    // Legacy ad actions (dari sistem lama, dipertahankan untuk backward compat log)
    APPROVE_AD: "menyetujui iklan",
    REJECT_AD: "menolak iklan",
    // Ad actions (sistem WA-manual)
    VERIFY_AD_PAYMENT: "memverifikasi pembayaran iklan",
    APPROVE_AD_CREATIVE: "menyetujui materi iklan",
    REJECT_AD_CREATIVE: "menolak materi iklan",
    EXPIRE_AD_ORDER: "menandai iklan kadaluarsa",
    DELETE_AD_ORDER: "menghapus iklan permanent",
};

export default async function AdminOverviewPage() {
    const session = await requireRole(["ADMIN", "SUPER_ADMIN"]);

    const [stats, monthly, byCategory, activities] = await Promise.all([
        getAdminStats(),
        getPublishedArticlesByMonth(),
        getArticleCountByCategory(),
        getRecentActivities(5),
    ]);

    return (
        <div>
            <div className="mb-6">
                <h1 className="font-serif text-3xl font-bold text-neutral-900 dark:text-white">
                    Selamat datang, {session.user.name} 👋
                </h1>
                <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                    Berikut ringkasan aktivitas Cipanas.com hari ini.
                </p>
            </div>

            <AdminStatsCards stats={stats} />

            {/* Quick action untuk review pending */}
            {stats.pendingArticles > 0 && (
                <div className="mt-6 rounded-xl border-l-4 border-amber-500 bg-amber-50 p-5 dark:bg-amber-900/20">
                    <div className="flex items-start gap-3">
                        <Clock className="mt-0.5 h-5 w-5 text-amber-600 dark:text-amber-400" />
                        <div className="flex-1">
                            <p className="font-semibold text-neutral-900 dark:text-white">
                                Ada {stats.pendingArticles} artikel menunggu review
                            </p>
                            <p className="mt-0.5 text-sm text-neutral-600 dark:text-neutral-400">
                                Kontributor menunggu konfirmasi dari Anda.
                            </p>
                        </div>
                        <Link
                            href="/admin/berita?status=PENDING"
                            className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700"
                        >
                            Review Sekarang
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </div>
            )}

            {/* Charts */}
            <div className="mt-8">
                <AdminOverviewCharts monthly={monthly} byCategory={byCategory} />
            </div>

            {/* Recent activity */}
            <div className="mt-8 rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
                <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-brand-600" />
                        <h3 className="font-serif text-lg font-bold text-neutral-900 dark:text-white">
                            Aktivitas Terbaru
                        </h3>
                    </div>
                    <Link
                        href="/admin/log"
                        className="text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
                    >
                        Lihat semua →
                    </Link>
                </div>

                {activities.length === 0 ? (
                    <p className="py-6 text-center text-sm text-neutral-500">
                        Belum ada aktivitas admin.
                    </p>
                ) : (
                    <ul className="space-y-3">
                        {activities.map((act) => (
                            <li key={act.id} className="flex items-start gap-3 text-sm">
                                <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-brand-500" />
                                <div className="flex-1">
                                    <span className="font-semibold text-neutral-900 dark:text-white">
                                        {act.user.name}
                                    </span>{" "}
                                    <span className="text-neutral-600 dark:text-neutral-400">
                                        {actionLabels[act.action] ?? act.action}
                                    </span>
                                </div>
                                <span className="text-xs text-neutral-500">
                                    {formatRelativeTime(act.createdAt)}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Cron controls (trigger manual) */}
            <div className="mt-8 rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                        <h3 className="font-serif text-lg font-bold text-neutral-900 dark:text-white">
                            Cron Iklan (Auto-Expire)
                        </h3>
                        <p className="mt-1 text-xs text-neutral-500">
                            Trigger manual untuk scan iklan{" "}
                            <span className="font-mono font-semibold text-neutral-700 dark:text-neutral-300">
                                ACTIVE
                            </span>{" "}
                            yang{" "}
                            <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                                endDate-nya sudah lewat
                            </span>{" "}
                            dan ubah status jadi{" "}
                            <span className="font-mono font-semibold text-neutral-700 dark:text-neutral-300">
                                EXPIRED
                            </span> 
                            . Iklan yang masih dalam periode tayang{" "}
                            <strong>tidak akan tersentuh</strong>. Untuk stop iklan
                            aktif manual atau hapus iklan expired, buka detail iklan
                            di{" "}
                            <Link
                                href="/admin/iklan"
                                className="font-mono text-brand-600 hover:underline dark:text-brand-400"
                            >
                                /admin/iklan
                            </Link>
                            .
                        </p>
                    </div>
                    <RunCronButton />
                </div>
            </div>
        </div>
    );
}