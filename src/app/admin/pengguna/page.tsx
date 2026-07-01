// src/app/admin/pengguna/page.tsx
import { requireRole } from "@/lib/auth-utils";
import { getAllUsers, getUserCountsByRole } from "@/lib/admin-queries";
import { UserManager } from "@/components/admin/UserManager";

export default async function AdminPenggunaPage() {
  const session = await requireRole(["ADMIN", "SUPER_ADMIN"]);

  const [users, counts] = await Promise.all([
    getAllUsers(),
    getUserCountsByRole(),
  ]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-3xl font-bold text-neutral-900 dark:text-white">
          Kelola Pengguna
        </h1>
        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
          Kelola role dan akses pengguna Cipanas.com.
        </p>
      </div>

      <UserManager
        users={users}
        counts={counts}
        currentUserId={session.user.id}
        currentUserRole={session.user.role}
      />
    </div>
  );
}