// src/components/layout/ThemeToggle.tsx
"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";

// Subscribe function untuk sync external store (window mounted state)
function subscribe() {
  // No-op — kita hanya perlu snapshot yang stabil
  return () => {};
}

// Snapshot untuk client (true = sudah mounted)
function getSnapshot() {
  return true;
}

// Snapshot untuk server (false = belum mounted)
function getServerSnapshot() {
  return false;
}

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const mounted = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // Hindari hydration mismatch — render placeholder di server
  if (!mounted) {
    return <div className="h-8 w-8" />;
  }

  return (
    <button
      onClick={toggleTheme}
      className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-600 transition hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
      aria-label={theme === "dark" ? "Aktifkan mode terang" : "Aktifkan mode gelap"}
    >
      {theme === "dark" ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </button>
  );
}