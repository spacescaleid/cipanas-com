// src/app/(auth)/layout.tsx
import Link from "next/link";
import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <div className="flex min-h-screen flex-col">
        <header className="border-b border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
            <Link
              href="/"
              className="font-serif text-2xl font-bold text-brand-700 dark:text-brand-400"
            >
              Cipanas<span className="text-accent-500">.com</span>
            </Link>
            <Link
              href="/"
              className="text-sm text-neutral-600 hover:text-brand-600 dark:text-neutral-400 dark:hover:text-brand-400"
            >
              ← Kembali ke Beranda
            </Link>
          </div>
        </header>

        <main className="flex flex-1 items-center justify-center px-4 py-12">
          <div className="w-full max-w-md">{children}</div>
        </main>
      </div>
    </div>
  );
}