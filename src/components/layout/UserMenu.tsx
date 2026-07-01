// src/components/layout/UserMenu.tsx
"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { LogOut, LayoutDashboard, Shield, User as UserIcon } from "lucide-react";

export function UserMenu() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (status === "loading") {
    return (
      <div className="h-8 w-20 animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-800" />
    );
  }

  if (!session?.user) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/login"
          className="text-sm font-medium text-neutral-700 hover:text-brand-600 dark:text-neutral-300 dark:hover:text-brand-400"
        >
          Masuk
        </Link>
        <Link
          href="/register"
          className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700"
        >
          Daftar
        </Link>
      </div>
    );
  }

  const role = session.user.role;
  const isAdmin = role === "ADMIN" || role === "SUPER_ADMIN";
  const dashboardHref = isAdmin ? "/admin" : "/dashboard";
  const dashboardLabel = isAdmin ? "Panel Admin" : "Dashboard";
  const DashboardIcon = isAdmin ? Shield : LayoutDashboard;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-2.5 py-1.5 text-sm transition hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:bg-neutral-800"
      >
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
          {session.user.name?.charAt(0).toUpperCase() ?? "U"}
        </div>
        <span className="hidden max-w-[120px] truncate text-neutral-700 dark:text-neutral-200 sm:inline">
          {session.user.name}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-40 mt-2 w-56 overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-lg dark:border-neutral-700 dark:bg-neutral-900">
          <div className="border-b border-neutral-100 px-4 py-3 dark:border-neutral-800">
            <div className="truncate text-sm font-semibold text-neutral-900 dark:text-white">
              {session.user.name}
            </div>
            <div className="mt-0.5 truncate text-xs text-neutral-500">
              {session.user.email}
            </div>
            <div className="mt-1 inline-block rounded bg-brand-100 px-1.5 py-0.5 text-[10px] font-semibold text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
              {role}
            </div>
          </div>

          <div className="py-1">
            <Link
              href={dashboardHref}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-800"
            >
              <DashboardIcon className="h-4 w-4" />
              {dashboardLabel}
            </Link>
            <Link
              href="/dashboard/profil"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-800"
            >
              <UserIcon className="h-4 w-4" />
              Profil
            </Link>
            <button
              onClick={() => {
                setOpen(false);
                signOut({ callbackUrl: "/" });
              }}
              className="flex w-full items-center gap-2 border-t border-neutral-100 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:border-neutral-800 dark:hover:bg-red-950/30"
            >
              <LogOut className="h-4 w-4" />
              Keluar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}