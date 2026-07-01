// src/app/dashboard/page.tsx
import { signOut } from "next-auth/react";
import { requireRole } from "@/lib/auth-helpers";
import { SignOutButton } from "@/components/auth/SignOutButton";

export default async function DashboardPage() {
  const session = await requireRole(["CONTRIBUTOR", "ADMIN", "SUPER_ADMIN"]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-neutral-900 dark:text-white">
            Dashboard Kontributor
          </h1>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">
            Halo, <strong>{session.user.name}</strong> — Role:{" "}
            <span className="rounded bg-brand-100 px-2 py-0.5 text-xs font-semibold text-brand-700 dark:bg-brand-900 dark:text-brand-300">
              {session.user.role}
            </span>
          </p>
        </div>
        <SignOutButton />
      </div>

      <div className="rounded-xl border border-dashed border-neutral-300 p-12 text-center text-neutral-500 dark:border-neutral-700">
        Placeholder — editor artikel akan dibangun di Tahap 4.
      </div>
    </div>
  );
}