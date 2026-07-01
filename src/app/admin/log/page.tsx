// src/app/admin/log/page.tsx
import { requireRole } from "@/lib/auth-utils";
import {
  getActivityLogs,
  getUniqueLogActions,
} from "@/lib/admin-queries";
import { ActivityLogList } from "@/components/admin/ActivityLogList";

export default async function AdminLogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; action?: string }>;
}) {
  await requireRole(["ADMIN", "SUPER_ADMIN"]);

  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const action = sp.action;

  const [{ logs, total, totalPages, currentPage }, actions] = await Promise.all([
    getActivityLogs({ page, pageSize: 20, action }),
    getUniqueLogActions(),
  ]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-3xl font-bold text-neutral-900 dark:text-white">
          Log Aktivitas
        </h1>
        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
          Riwayat semua aksi admin di sistem Cipanas.com.
        </p>
      </div>

      <ActivityLogList
        logs={logs}
        currentPage={currentPage}
        totalPages={totalPages}
        total={total}
        actions={actions}
        currentAction={action}
      />
    </div>
  );
}