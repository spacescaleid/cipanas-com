// src/app/dashboard/layout.tsx
import Link from "next/link";
import type { ReactNode } from "react";
import {
  LayoutDashboard,
  PenSquare,
  FileText,
  User,
  TrendingUp,
  Bell,
} from "lucide-react";
import { requireRole } from "@/lib/auth-utils";
import { SignOutButton } from "@/components/auth/SignOutButton";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await requireRole(["CONTRIBUTOR", "ADMIN", "SUPER_ADMIN"]);

  // src/app/dashboard/layout.tsx
// Ganti bagian navItems saja:

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/tulis", label: "Tulis Berita", icon: PenSquare },
  { href: "/dashboard/tulisan", label: "Tulisan Saya", icon: FileText },
  { href: "/dashboard/statistik", label: "Statistik", icon: TrendingUp },
  { href: "/dashboard/notifikasi", label: "Notifikasi", icon: Bell },
  { href: "/dashboard/profil", label: "Profil", icon: User },
];

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="font-serif text-2xl font-bold text-brand-700 dark:text-brand-400"
            >
              Cipanas<span className="text-accent-500">.com</span>
            </Link>
            <span className="hidden text-xs uppercase tracking-wider text-neutral-500 md:inline">
              Dashboard Kontributor
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right text-xs md:block">
              <div className="font-semibold text-neutral-900 dark:text-white">
                {session.user.name}
              </div>
              <div className="text-neutral-500">{session.user.role}</div>
            </div>
            <SignOutButton />
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6">
        {/* Sidebar */}
        <aside className="hidden w-56 shrink-0 md:block">
          <nav className="sticky top-20 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100 hover:text-brand-700 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-brand-400"
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main content */}
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}