// src/app/admin/page.tsx
import { requireRole } from "@/lib/auth-helpers";
import { SignOutButton } from "@/components/auth/SignOutButton";

export default async function AdminPage() {
  const session = await requireRole(["ADMIN", "SUPER_ADMIN"]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-neutral-900 dark:text-white">
            Panel Admin
          </h1>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">
            Halo, <strong>{session.user.name}</strong> — Role:{" "}
            <span className="rounded bg-accent-100 px-2 py-0.5 text-xs font-semibold text-accent-700 dark:bg-accent-900 dark:text-accent-300">
              {session.user.role}
            </span>
          </p>
        </div>
        <SignOutButton />
      </div>

      <div className="rounded-xl border border-dashed border-neutral-300 p-12 text-center text-neutral-500 dark:border-neutral-700">
        Placeholder — dashboard admin akan dibangun di Tahap 5.
      </div>
    </div>
  );
}