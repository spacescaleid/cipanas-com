// src/components/admin/ArticleReviewActions.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle, AlertCircle, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface Props {
  articleId: string;
  articleStatus: string;
}

type ActionType = "approve" | "reject" | "revision" | null;

export function ArticleReviewActions({ articleId, articleStatus }: Props) {
  const router = useRouter();
  const [action, setAction] = useState<ActionType>(null);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  if (articleStatus !== "PENDING") {
    return (
      <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-6 dark:border-neutral-800 dark:bg-neutral-900">
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Aksi review hanya tersedia untuk artikel berstatus <strong>PENDING</strong>.
        </p>
      </div>
    );
  }

  const handleApprove = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/articles/${articleId}/approve`, {
        method: "POST",
      });
      const result = await res.json();
      if (!res.ok) {
        toast.error(result.error ?? "Gagal");
        setLoading(false);
        return;
      }
      toast.success("Artikel dipublikasikan");
      router.refresh();
      router.push("/admin/berita?status=PENDING");
    } catch (error) {
      console.error(error);
      toast.error("Terjadi kesalahan");
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (note.trim().length < 10) {
      toast.error("Alasan penolakan minimal 10 karakter");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/articles/${articleId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note }),
      });
      const result = await res.json();
      if (!res.ok) {
        toast.error(result.error ?? "Gagal");
        setLoading(false);
        return;
      }
      toast.success("Artikel ditolak");
      router.refresh();
      router.push("/admin/berita?status=PENDING");
    } catch (error) {
      console.error(error);
      toast.error("Terjadi kesalahan");
      setLoading(false);
    }
  };

  const handleRevision = async () => {
    if (note.trim().length < 10) {
      toast.error("Catatan revisi minimal 10 karakter");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/articles/${articleId}/revision`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note }),
      });
      const result = await res.json();
      if (!res.ok) {
        toast.error(result.error ?? "Gagal");
        setLoading(false);
        return;
      }
      toast.success("Permintaan revisi terkirim");
      router.refresh();
      router.push("/admin/berita?status=PENDING");
    } catch (error) {
      console.error(error);
      toast.error("Terjadi kesalahan");
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
      <h3 className="font-serif text-lg font-bold text-neutral-900 dark:text-white">
        Aksi Review
      </h3>
      <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
        Pilih tindakan untuk artikel ini.
      </p>

      {action === null ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <button
            type="button"
            onClick={() => setAction("approve")}
            className="flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700"
          >
            <CheckCircle2 className="h-4 w-4" />
            Setujui & Tayangkan
          </button>
          <button
            type="button"
            onClick={() => setAction("revision")}
            className="flex items-center justify-center gap-2 rounded-lg bg-accent-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-700"
          >
            <AlertCircle className="h-4 w-4" />
            Minta Revisi
          </button>
          <button
            type="button"
            onClick={() => setAction("reject")}
            className="flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            <XCircle className="h-4 w-4" />
            Tolak
          </button>
        </div>
      ) : action === "approve" ? (
        <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
          <p className="text-sm text-neutral-700 dark:text-neutral-300">
            Yakin ingin mempublikasikan artikel ini? Artikel akan langsung tayang di
            homepage dan bisa diakses publik.
          </p>
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={() => setAction(null)}
              disabled={loading}
              className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleApprove}
              disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Ya, Tayangkan Sekarang
            </button>
          </div>
        </div>
      ) : (
        <div
          className={`mt-4 rounded-lg border p-4 ${
            action === "reject"
              ? "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20"
              : "border-accent-200 bg-accent-50 dark:border-accent-800 dark:bg-accent-900/20"
          }`}
        >
          <label className="mb-1.5 block text-sm font-semibold text-neutral-700 dark:text-neutral-300">
            {action === "reject" ? "Alasan Penolakan" : "Catatan Revisi"}
          </label>
          <textarea
            rows={4}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={
              action === "reject"
                ? "Jelaskan mengapa artikel ini ditolak..."
                : "Jelaskan bagian mana yang perlu direvisi..."
            }
            className="w-full resize-y rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
          />
          <p className="mt-1 text-xs text-neutral-500">
            {note.length}/1000 karakter (minimal 10)
          </p>

          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={() => {
                setAction(null);
                setNote("");
              }}
              disabled={loading}
              className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={action === "reject" ? handleReject : handleRevision}
              disabled={loading || note.trim().length < 10}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-60 ${
                action === "reject"
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-accent-600 hover:bg-accent-700"
              }`}
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {action === "reject" ? "Tolak Artikel" : "Kirim Revisi"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}