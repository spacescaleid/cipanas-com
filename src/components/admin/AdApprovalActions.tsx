// src/components/admin/AdApprovalActions.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface Props {
  orderId: string;
  orderStatus: string;
}

type ActionType = "approve" | "reject" | null;

async function safeJson(res: Response): Promise<Record<string, unknown> | null> {
  try {
    const text = await res.text();
    if (!text) return null;
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export function AdApprovalActions({ orderId, orderStatus }: Props) {
  const router = useRouter();
  const [action, setAction] = useState<ActionType>(null);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  if (orderStatus === "PENDING_PAYMENT") {
    return (
      <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-6 dark:border-neutral-800 dark:bg-neutral-900">
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Pengiklan belum melakukan pembayaran. Aksi tersedia setelah pembayaran diterima.
        </p>
      </div>
    );
  }

  if (orderStatus !== "PENDING_APPROVAL") {
    return (
      <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-6 dark:border-neutral-800 dark:bg-neutral-900">
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Order sudah diproses. Status saat ini:{" "}
          <strong className="text-brand-700 dark:text-brand-400">
            {orderStatus}
          </strong>
        </p>
      </div>
    );
  }

  const handleApprove = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/ads/${orderId}/approve`, {
        method: "POST",
      });
      const result = await safeJson(res);
      if (!res.ok) {
        toast.error((result?.error as string) ?? "Gagal");
        setLoading(false);
        return;
      }
      toast.success("Iklan disetujui dan sekarang aktif");
      router.refresh();
      router.push("/admin/iklan?status=PENDING_APPROVAL");
    } catch (error) {
      console.error(error);
      toast.error("Terjadi kesalahan");
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (reason.trim().length < 10) {
      toast.error("Alasan penolakan minimal 10 karakter");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/ads/${orderId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      const result = await safeJson(res);
      if (!res.ok) {
        toast.error((result?.error as string) ?? "Gagal");
        setLoading(false);
        return;
      }
      toast.success("Iklan ditolak");
      router.refresh();
      router.push("/admin/iklan?status=PENDING_APPROVAL");
    } catch (error) {
      console.error(error);
      toast.error("Terjadi kesalahan");
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
      <h3 className="font-serif text-lg font-bold text-neutral-900 dark:text-white">
        Aksi Approval
      </h3>
      <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
        Pengiklan sudah membayar. Setujui untuk mulai menayangkan iklan.
      </p>

      {action === null ? (
        <div className="mt-4 space-y-2">
          <button
            type="button"
            onClick={() => setAction("approve")}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700"
          >
            <CheckCircle2 className="h-4 w-4" />
            Setujui & Tayangkan
          </button>
          <button
            type="button"
            onClick={() => setAction("reject")}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-300 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-100 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400"
          >
            <XCircle className="h-4 w-4" />
            Tolak
          </button>
        </div>
      ) : action === "approve" ? (
        <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
          <p className="text-sm text-neutral-700 dark:text-neutral-300">
            Iklan akan langsung tayang di posisi yang dipilih pengiklan.
          </p>
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={() => setAction(null)}
              disabled={loading}
              className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 disabled:opacity-60 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300"
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
              Ya, Tayangkan
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
          <label className="mb-1.5 block text-sm font-semibold text-neutral-700 dark:text-neutral-300">
            Alasan Penolakan
          </label>
          <textarea
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Jelaskan mengapa iklan ini ditolak..."
            className="w-full resize-y rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
          />
          <p className="mt-1 text-xs text-neutral-500">
            {reason.length}/500 karakter (minimal 10)
          </p>

          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => {
                setAction(null);
                setReason("");
              }}
              disabled={loading}
              className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 disabled:opacity-60 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleReject}
              disabled={loading || reason.trim().length < 10}
              className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Tolak Iklan
            </button>
          </div>
        </div>
      )}
    </div>
  );
}