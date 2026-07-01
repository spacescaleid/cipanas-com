// src/app/(public)/loading.tsx
export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 animate-pulse">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="aspect-[16/10] rounded-2xl bg-neutral-200 dark:bg-neutral-800" />
        </div>
        <div className="grid gap-4">
          <div className="aspect-[16/10] rounded-xl bg-neutral-200 dark:bg-neutral-800" />
          <div className="aspect-[16/10] rounded-xl bg-neutral-200 dark:bg-neutral-800" />
        </div>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <div className="aspect-[16/9] rounded-xl bg-neutral-200 dark:bg-neutral-800" />
            <div className="h-4 w-3/4 rounded bg-neutral-200 dark:bg-neutral-800" />
            <div className="h-4 w-1/2 rounded bg-neutral-200 dark:bg-neutral-800" />
          </div>
        ))}
      </div>
    </div>
  );
}