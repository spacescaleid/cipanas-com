// src/components/admin/AdminArticleActions.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { EyeOff, Trash2, Loader2, ExternalLink, Pencil } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

interface Props {
  articleId: string;
  articleSlug: string;
  articleTitle: string;
  articleStatus: string;
}

type ActionType = "unpublish" | "delete" | null;

export function AdminArticleActions({
  articleId,
  articleSlug,
  articleTitle,
  articleStatus,
}: Props) {
  const router = useRouter();
  const [action, setAction] = useState<ActionType>(null);
  const [loading, setLoading] = useState(false);

  const isPublished = articleStatus === "PUBLISHED";

  const handleUnpublish = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/articles/${articleId}/unpublish`,
        { method: "POST" }
      );
      const result = await res.json();
      if (!res.ok) {
        toast.error(result.error ?? "Gagal");
        setLoading(false);
        return;
      }
      toast.success("Artikel diturunkan");
      router.refresh();
      router.push("/admin/berita");
    } catch (error) {
      console.error(error);
      toast.error("Terjadi kesalahan");
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/articles/${articleId}`, {
        method: "DELETE",
      });
      const result = await res.json();
      if (!res.ok) {
        toast.error(result.error ?? "Gagal");
        setLoading(false);
        return;
      }
      toast.success("Artikel dihapus");
      router.refresh();
      router.push("/admin/berita");
    } catch (error) {
      console.error(error);
      toast.error("Terjadi kesalahan");
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
      <h3 className="font-serif text-lg font-bold text-neutral-900 dark:text-white">
        Aksi Admin
      </h3>
      <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
        Kelola artikel ini.
      </p>

      <div className="mt-4 space-y-2">
        {isPublished && (
          <Link
            href={`/berita/${articleSlug}`}
            target="_blank"
            className="flex items-center justify-center gap-2 rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
          >
            <ExternalLink className="h-4 w-4" />
            Lihat di Situs Publik
          </Link>
        )}

        {articleStatus !== "PUBLISHED" && articleStatus !== "PENDING" && (
          <Link
            href={`/dashboard/tulis/${articleId}`}
            className="flex items-center justify-center gap-2 rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
          >
            <Pencil className="h-4 w-4" />
            Edit Artikel
          </Link>
        )}

        {isPublished && (
          <button
            type="button"
            onClick={() => setAction("unpublish")}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-400"
          >
            <EyeOff className="h-4 w-4" />
            Turunkan Artikel
          </button>
        )}

        <button
          type="button"
          onClick={() => setAction("delete")}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400"
        >
          <Trash2 className="h-4 w-4" />
          Hapus Permanen
        </button>
      </div>

      {/* Modal konfirmasi */}
      {action && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-fade-in"
          onClick={() => !loading && setAction(null)}
        >
          <div
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl dark:bg-neutral-900"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-serif text-xl font-bold text-neutral-900 dark:text-white">
              {action === "unpublish" ? "Turunkan Artikel?" : "Hapus Artikel?"}
            </h3>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
              {action === "unpublish" ? (
                <>
                  Artikel <strong>&ldquo;{articleTitle}&rdquo;</strong> akan
                  disembunyikan dari publik dan diubah statusnya menjadi DRAFT.
                  Kontributor bisa mengedit dan mengirim ulang untuk review.
                </>
              ) : (
                <>
                  Anda akan menghapus artikel{" "}
                  <strong>&ldquo;{articleTitle}&rdquo;</strong> secara permanen.
                  <span className="mt-2 block font-semibold text-red-600">
                    Tindakan ini TIDAK dapat dibatalkan.
                  </span>
                </>
              )}
            </p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setAction(null)}
                disabled={loading}
                className="flex-1 rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 disabled:opacity-60 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={
                  action === "unpublish" ? handleUnpublish : handleDelete
                }
                disabled={loading}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-60 ${
                  action === "unpublish"
                    ? "bg-amber-600 hover:bg-amber-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {action === "unpublish" ? "Ya, Turunkan" : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}