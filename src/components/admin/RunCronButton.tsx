// src/components/admin/RunCronButton.tsx
"use client";

import { useState, useTransition } from "react";
import toast from "react-hot-toast";

export function RunCronButton() {
  const [isPending, startTransition] = useTransition();
  const [lastResult, setLastResult] = useState<{
    expiredCount: number;
    timestamp: string;
  } | null>(null);

  const handleRunCron = () => {
    startTransition(async () => {
      try {
        const response = await fetch("/api/cron/ads", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Gagal menjalankan cron");
        }

        setLastResult({
          expiredCount: data.expiredCount,
          timestamp: data.timestamp,
        });

        if (data.expiredCount === 0) {
          toast.success("✅ Tidak ada iklan yang perlu di-expire");
        } else {
          toast.success(`✅ ${data.expiredCount} iklan berhasil di-expire`);
        }
      } catch (err) {
        toast.error(
          `❌ ${err instanceof Error ? err.message : "Unknown error"}`
        );
      }
    });
  };

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        type="button"
        onClick={handleRunCron}
        disabled={isPending}
        className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 transition-colors inline-flex items-center gap-2"
      >
        {isPending ? (
          <>
            <svg
              className="h-4 w-4 animate-spin"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Menjalankan...
          </>
        ) : (
          "Jalankan Cron"
        )}
      </button>

      {lastResult && (
        <p className="text-xs text-neutral-500">
          Terakhir: {lastResult.expiredCount} iklan di-expire (
          {new Date(lastResult.timestamp).toLocaleTimeString("id-ID")})
        </p>
      )}
    </div>
  );
}