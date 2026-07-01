import { requireAuth } from "@/lib/auth-utils";

export default async function ProfilPage() {
  const session = await requireAuth();
  return (
    <div>
      <h1 className="font-serif text-3xl font-bold text-neutral-900 dark:text-white">
        Profil
      </h1>
      <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between border-b border-neutral-100 pb-2 dark:border-neutral-800">
            <dt className="font-medium text-neutral-500">Nama</dt>
            <dd className="text-neutral-900 dark:text-white">{session.user.name}</dd>
          </div>
          <div className="flex justify-between border-b border-neutral-100 pb-2 dark:border-neutral-800">
            <dt className="font-medium text-neutral-500">Email</dt>
            <dd className="text-neutral-900 dark:text-white">{session.user.email}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="font-medium text-neutral-500">Role</dt>
            <dd className="text-neutral-900 dark:text-white">{session.user.role}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}