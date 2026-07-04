// src/app/admin/komentar/AdminCommentActions.tsx
"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Ban, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import type { CommentStatus } from "@prisma/client";

import {
  approveCommentAction,
  markCommentAsSpamAction,
  adminDeleteCommentAction,
} from "@/actions/admin-comment-actions";

interface Props {
  commentId: string;
  status: CommentStatus;
}

export function AdminCommentActions({ commentId, status }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleApprove = () => {
    startTransition(async () => {
      const result = await approveCommentAction(commentId);
      if (result.success) {
        toast.success("Komentar disetujui");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  const handleSpam = () => {
    startTransition(async () => {
      const result = await markCommentAsSpamAction(commentId);
      if (result.success) {
        toast.success("Komentar ditandai spam");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  const handleDelete = () => {
    if (!confirm("Hapus komentar ini permanent?")) return;

    startTransition(async () => {
      const result = await adminDeleteCommentAction(commentId);
      if (result.success) {
        toast.success("Komentar dihapus");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <div className="flex flex-wrap gap-2">
      {status !== "APPROVED" && (
        <button
          type="button"
          onClick={handleApprove}
          disabled={isPending}
          className="inline-flex items-center gap-1 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-50"
        >
          <Check className="h-3 w-3" />
          {isPending ? "..." : "Setujui"}
        </button>
      )}

      {status !== "SPAM" && (
        <button
          type="button"
          onClick={handleSpam}
          disabled={isPending}
          className="inline-flex items-center gap-1 rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-50 disabled:opacity-50 dark:border-amber-700 dark:bg-neutral-900 dark:text-amber-400"
        >
          <Ban className="h-3 w-3" />
          {isPending ? "..." : "Spam"}
        </button>
      )}

      <button
        type="button"
        onClick={handleDelete}
        disabled={isPending}
        className="inline-flex items-center gap-1 rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-700 dark:bg-neutral-900 dark:text-red-400"
      >
        <Trash2 className="h-3 w-3" />
        {isPending ? "..." : "Hapus"}
      </button>
    </div>
  );
}