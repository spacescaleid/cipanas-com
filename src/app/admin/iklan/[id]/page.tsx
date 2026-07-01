export default async function AdminIklanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div>
      <h1 className="font-serif text-3xl font-bold text-neutral-900 dark:text-white">
        Detail Iklan
      </h1>
      <p className="mt-2 text-sm text-neutral-500">ID: {id}</p>
      <div className="mt-6 rounded-xl border border-dashed border-neutral-300 p-12 text-center text-neutral-500 dark:border-neutral-700">
        Detail & aksi approve — Tahap 6.
      </div>
    </div>
  );
}