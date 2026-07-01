// src/app/dashboard/profil/page.tsx
import { requireAuth } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { ProfileForm } from "@/components/dashboard/ProfileForm";
import { notFound } from "next/navigation";

export default async function ProfilPage() {
  const session = await requireAuth();

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      bio: true,
      image: true,
      role: true,
    },
  });

  if (!user) notFound();

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-3xl font-bold text-neutral-900 dark:text-white">
          Profil Saya
        </h1>
        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
          Kelola informasi profil Anda.
        </p>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
        <ProfileForm initialData={user} />
      </div>
    </div>
  );
}