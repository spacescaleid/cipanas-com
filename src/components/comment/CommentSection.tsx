// src/components/comment/CommentSection.tsx
import { MessageSquare } from "lucide-react";

import { getApprovedComments } from "@/actions/comment-actions";
import { serializePrisma } from "@/lib/serialize";
import { CommentForm } from "./CommentForm";
import { CommentList } from "./CommentList";

interface Props {
  articleId?: string;
  videoId?: string;
}

/**
 * Server component wrapper untuk section komentar.
 * Dipakai di halaman detail artikel dan video.
 *
 * - Fetch approved comments dari DB (server-side)
 * - Render CommentForm (client component, butuh login check)
 * - Render CommentList (server component, display approved comments)
 */
export async function CommentSection({ articleId, videoId }: Props) {
  const commentsRaw = await getApprovedComments({ articleId, videoId });
  const comments = serializePrisma(commentsRaw);

  return (
    <section className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
      {/* Header */}
      <div className="mb-5 flex items-center gap-2 border-b border-neutral-200 pb-3 dark:border-neutral-800">
        <MessageSquare className="h-5 w-5 text-brand-600 dark:text-brand-400" />
        <h2 className="font-serif text-lg font-bold text-neutral-900 dark:text-white">
          Komentar ({comments.length})
        </h2>
      </div>

      {/* Form (client component — cek login di dalamnya) */}
      <div className="mb-6">
        <CommentForm articleId={articleId} videoId={videoId} />
      </div>

      {/* List (approved comments) */}
      <CommentList comments={comments} />
    </section>
  );
}