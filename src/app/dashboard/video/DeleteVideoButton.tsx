// src/app/dashboard/video/DeleteVideoButton.tsx
"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import toast from "react-hot-toast";

import { deleteMyVideoAction } from "@/actions/video-actions";

interface Props {
  videoId: string;
  videoTitle: string;
}

export function DeleteVideoButton({ videoId, videoTitle }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!confirm(`Hapus video "${videoTitle}"?\nAksi ini tidak bisa di-undo.`)) {
      return;
    }

    startTransition(async () => {
      const result = await deleteMyVideoAction(videoId);
      if (result.success) {
        toast.success("Video dihapus");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isPending}
      className="inline-flex items-center gap-1.5 rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-800 dark:bg-neutral-900 dark:hover:bg-red-950/30"
    >
      <Trash2 className="h-3 w-3" />
      {isPending ? "Menghapus..." : "Hapus"}
    </button>
  );
}