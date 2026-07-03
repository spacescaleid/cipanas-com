// src/app/admin/video/[id]/AdminVideoActions.tsx
"use client";

import { useState, useActionState, useEffect, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Check, X, Trash2 } from "lucide-react";
import type { VideoStatus } from "@prisma/client";

import {
  approveVideoAction,
  rejectVideoAction,
  adminDeleteVideoAction,
} from "@/actions/admin-video-actions";
import type { ActionResult } from "@/actions/video-actions";

interface Props {
  videoId: string;
  status: VideoStatus;
}

export function AdminVideoActions({ videoId, status }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showRejectForm, setShowRejectForm] = useState(false);

  const handleApprove = () => {
    if (!confirm("Approve video ini dan publish ke halaman publik?")) return;

    startTransition(async () => {
      const result = await approveVideoAction(videoId);
      if (result.success) {
        toast.success("Video berhasil di-publish!");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  const handleDelete = () => {
    if (
      !confirm(
        "🗑️ HAPUS PERMANENT?\n\nVideo ini akan dihapus PERMANENT dari database.\nAksi ini TIDAK BISA di-undo.\n\nLanjutkan?"
      )
    )
      return;

    startTransition(async () => {
      const result = await adminDeleteVideoAction(videoId);
      if (result.success) {
        toast.success("Video dihapus permanent");
        router.push("/admin/video");
      } else {
        toast.error(result.error);
      }
    });
  };

  // Reject form dengan useActionState
  const [rejectState, rejectFormAction, isRejectPending] = useActionState(
    rejectVideoAction,
    null as ActionResult | null
  );

  const processedRejectStateRef = useRef<typeof rejectState>(null);

  useEffect(() => {
    if (rejectState === processedRejectStateRef.current) return;
    processedRejectStateRef.current = rejectState;

    if (rejectState?.success) {
      toast.success("Video ditolak");
      startTransition(() => {
        setShowRejectForm(false);
      });
      router.refresh();
    } else if (rejectState && !rejectState.success && rejectState.error) {
      toast.error(rejectState.error);
    }
  }, [rejectState, router]);

  return (
    <div className="space-y-3">
      {status === "PENDING" && (
        <>
          <button
            type="button"
            onClick={handleApprove}
            disabled={isPending}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
          >
            <Check className="h-4 w-4" />
            {isPending ? "Memproses..." : "Approve & Publish"}
          </button>
          <button
            type="button"
            onClick={() => setShowRejectForm(!showRejectForm)}
            disabled={isPending}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
          >
            <X className="h-4 w-4" />
            Tolak
          </button>

          {showRejectForm && (
            <form action={rejectFormAction} className="space-y-2 border-t border-neutral-200 pt-3 dark:border-neutral-800">
              <input type="hidden" name="videoId" value={videoId} />
              <label
                htmlFor="reason"
                className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300"
              >
                Alasan penolakan *
              </label>
              <textarea
                id="reason"
                name="reason"
                rows={3}
                placeholder="Contoh: Konten tidak relevan dengan Cipanas, sudah pernah di-upload sebelumnya, dsb."
                className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-xs text-neutral-900 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
              />
              <button
                type="submit"
                disabled={isRejectPending}
                className="w-full rounded-lg bg-red-600 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {isRejectPending ? "Memproses..." : "Kirim Penolakan"}
              </button>
            </form>
          )}
        </>
      )}

      {status === "PUBLISHED" && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-xs text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-200">
          ✅ Video sudah tayang di halaman publik
        </div>
      )}

      {status === "REJECTED" && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200">
          ❌ Video ditolak dan tidak tayang
        </div>
      )}

      {/* Delete permanent — always available */}
      <div className="border-t border-neutral-200 pt-3 dark:border-neutral-800">
        <button
          type="button"
          onClick={handleDelete}
          disabled={isPending}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-300 bg-white py-2 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-800 dark:bg-neutral-900 dark:hover:bg-red-950/30"
        >
          <Trash2 className="h-3 w-3" />
          Hapus Permanent
        </button>
      </div>
    </div>
  );
}