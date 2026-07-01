// src/app/dashboard/notifikasi/page.tsx
import { requireRole } from "@/lib/auth-utils";
import { getMyNotifications } from "@/lib/dashboard-queries";
import { NotificationTimeline } from "@/components/dashboard/NotificationTimeline";

export default async function NotifikasiPage() {
  const session = await requireRole([
    "CONTRIBUTOR",
    "ADMIN",
    "SUPER_ADMIN",
  ]);

  const notifications = await getMyNotifications(session.user.id, 30);

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-3xl font-bold text-neutral-900 dark:text-white">
          Notifikasi
        </h1>
        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
          Update terbaru dari admin tentang artikel Anda.
        </p>
      </div>

      <NotificationTimeline notifications={notifications} />
    </div>
  );
}