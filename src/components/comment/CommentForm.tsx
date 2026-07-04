// src/components/comment/CommentForm.tsx
"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Loader2, Send, LogIn } from "lucide-react";
import toast from "react-hot-toast";

import { createCommentAction } from "@/actions/comment-actions";

interface Props {
  articleId?: string;
  videoId?: string;
}

export function CommentForm({ articleId, videoId }: Props) {
  const { data: session, status } = useSession();
  const [content, setContent] = useState("");
  const [, startTransition] = useTransition();

  const [state, formAction, isPending] = useActionState(
    createCommentAction,
    null
  );

  useEffect(() => {
    if (state?.success) {
      toast.success(
        "Komentar terkirim! Akan muncul setelah disetujui admin."
      );
      startTransition(() => {
        setContent("");
      });
    } else if (state && !state.success && state.error) {
      toast.error(state.error);
    }
  }, [state, startTransition]);

  if (status === "loading") {
    return (
      <div className="h-20 animate-pulse rounded-lg bg-neutral-100 dark:bg-neutral-800" />
    );
  }

  if (!session?.user) {
    return (
      <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-5 text-center dark:border-neutral-800 dark:bg-neutral-900">
        <LogIn className="mx-auto h-6 w-6 text-neutral-400" />
        <p className="mt-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Login untuk berkomentar
        </p>
        <div className="mt-3 flex items-center justify-center gap-3">
          <Link
            href="/login"
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Masuk
          </Link>
          <Link
            href="/register"
            className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300"
          >
            Daftar
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-3">
      {articleId && <input type="hidden" name="articleId" value={articleId} />}
      {videoId && <input type="hidden" name="videoId" value={videoId} />}

      <div>
        <div className="flex items-center gap-2 mb-2">
          <div className="h-7 w-7 rounded-full bg-brand-100 flex items-center justify-center text-xs font-bold text-brand-600 dark:bg-brand-900/40 dark:text-brand-400">
            {session.user.name?.charAt(0).toUpperCase() ?? "U"}
          </div>
          <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            {session.user.name}
          </span>
        </div>

        <textarea
          name="content"
          rows={3}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Tulis komentar kamu..."
          maxLength={1000}
          className="w-full resize-y rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
        />

        <div className="mt-1 flex items-center justify-between text-xs">
          <p className="text-neutral-500">
            Komentar akan tampil setelah disetujui admin
          </p>
          <span className="text-neutral-400">{content.length}/1000</span>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending || content.trim().length < 3}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Mengirim...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Kirim Komentar
            </>
          )}
        </button>
      </div>
    </form>
  );
}