// src/app/dashboard/page.tsx
import { requireRole } from "@/lib/auth-utils";

export default async function DashboardPage() {
  const session = await requireRole(["CONTRIBUTOR", "ADMIN", "SUPER_ADMIN"]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-3xl font-bold text-neutral-900 dark:text-white">
          Selamat datang, {session.user.name} 👋
        </h1>
        <p className="mt-2 text-neutral-600 dark:text-neutral-400">
          Kelola tulisan Anda dan pantau performanya di sini.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-card dark:border-neutral-800 dark:bg-neutral-900">
          <div className="text-sm text-neutral-500">Total Artikel</div>
          <div className="mt-2 text-3xl font-bold text-neutral-900 dark:text-white">
            —
          </div>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-card dark:border-neutral-800 dark:bg-neutral-900">
          <div className="text-sm text-neutral-500">Terpublikasi</div>
          <div className="mt-2 text-3xl font-bold text-neutral-900 dark:text-white">
            —
          </div>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-card dark:border-neutral-800 dark:bg-neutral-900">
          <div className="text-sm text-neutral-500">Total Views</div>
          <div className="mt-2 text-3xl font-bold text-neutral-900 dark:text-white">
            —
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-xl border border-dashed border-neutral-300 p-12 text-center text-neutral-500 dark:border-neutral-700">
        Editor artikel akan dibangun di Tahap 4.
      </div>
    </div>
  );
}