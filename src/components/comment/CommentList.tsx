// src/components/comment/CommentList.tsx
import Image from "next/image";
import { Clock } from "lucide-react";

import { formatRelativeTime } from "@/lib/format";

interface CommentItem {
  id: string;
  content: string;
  createdAt: Date | string;
  user: {
    id: string;
    name: string;
    image: string | null;
  };
}

interface Props {
  comments: CommentItem[];
}

export function CommentList({ comments }: Props) {
  if (comments.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-neutral-300 py-8 text-center dark:border-neutral-700">
        <p className="text-sm text-neutral-500">
          Belum ada komentar. Jadilah yang pertama berkomentar!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <div
          key={comment.id}
          className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
        >
          <div className="flex items-start gap-3">
            <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full bg-brand-100 dark:bg-brand-900/40">
              {comment.user.image ? (
                <Image
                  src={comment.user.image}
                  alt={comment.user.name}
                  fill
                  sizes="32px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs font-bold text-brand-600 dark:text-brand-400">
                  {comment.user.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-neutral-900 dark:text-white">
                  {comment.user.name}
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-neutral-500">
                  <Clock className="h-3 w-3" />
                  {formatRelativeTime(comment.createdAt)}
                </span>
              </div>

              <p className="mt-1 whitespace-pre-wrap text-sm text-neutral-700 dark:text-neutral-300">
                {comment.content}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}