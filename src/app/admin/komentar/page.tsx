// src/app/admin/komentar/page.tsx
import Link from "next/link";
import Image from "next/image";
import { MessageSquare } from "lucide-react";
import type { CommentStatus } from "@prisma/client";

import { requireRole } from "@/lib/auth-utils";
import { getAllCommentsForAdmin } from "@/actions/admin-comment-actions";
import { formatRelativeTime } from "@/lib/format";
import { AdminCommentActions } from "./AdminCommentActions";

interface Props {
  searchParams: Promise<{ status?: string }>;
}

const STATUS_LABELS: Record<CommentStatus, string> = {
  PENDING: "Menunggu Review",
  APPROVED: "Disetujui",
  SPAM: "Spam",
};

const STATUS_COLORS: Record<CommentStatus, string> = {
  PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
  APPROVED: "bg-green-100 text-green-800 border-green-200",
  SPAM: "bg-red-100 text-red-800 border-red-200",
};

const ALL_STATUSES: CommentStatus[] = ["PENDING", "APPROVED", "SPAM"];

export default async function AdminKomentarPage({ searchParams }: Props) {
  await requireRole(["ADMIN", "SUPER_ADMIN"]);
  const { status: statusFilter } = await searchParams;
  const activeFilter = statusFilter ?? "ALL";

  const comments = await getAllCommentsForAdmin(
    activeFilter !== "ALL" ? activeFilter : undefined
  );

  const pendingCount = comments.filter((c) => c.status === "PENDING").length;

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-3xl font-bold text-neutral-900 dark:text-white">
          Moderasi Komentar
        </h1>
        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
          Kelola komentar dari pengguna di artikel dan video
        </p>
      </div>

      {pendingCount > 0 && activeFilter !== "PENDING" && (
        <div className="mb-6 rounded-xl border-l-4 border-amber-500 bg-amber-50 p-4 dark:bg-amber-900/20">
          <p className="text-sm font-semibold text-neutral-900 dark:text-white">
            ⏰ Ada {pendingCount} komentar menunggu review
          </p>
          <Link
            href="/admin/komentar?status=PENDING"
            className="mt-1 inline-block text-xs font-semibold text-amber-700 hover:underline dark:text-amber-300"
          >
            Review sekarang →
          </Link>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="mb-6 flex flex-wrap gap-2">
        <Link
          href="/admin/komentar"
          className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
            activeFilter === "ALL"
              ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
              : "border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400"
          }`}
        >
          Semua ({comments.length})
        </Link>
        {ALL_STATUSES.map((status) => (
          <Link
            key={status}
            href={`/admin/komentar?status=${status}`}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              activeFilter === status
                ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                : "border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400"
            }`}
          >
            {STATUS_LABELS[status]}
            {status === "PENDING" && pendingCount > 0 && activeFilter !== status && (
              <span className="ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-100 px-1 text-xs font-bold text-red-700">
                {pendingCount}
              </span>
            )}
          </Link>
        ))}
      </div>

      {/* List */}
      {comments.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-neutral-300 p-12 text-center dark:border-neutral-700">
          <MessageSquare className="mx-auto h-12 w-12 text-neutral-400" />
          <p className="mt-4 text-sm text-neutral-500">
            Tidak ada komentar dengan filter ini
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900"
            >
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-brand-100 dark:bg-brand-900/40">
                  {comment.user.image ? (
                    <Image
                      src={comment.user.image}
                      alt={comment.user.name}
                      fill
                      sizes="40px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm font-bold text-brand-600 dark:text-brand-400">
                      {comment.user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-neutral-900 dark:text-white">
                      {comment.user.name}
                    </span>
                    <span className="text-xs text-neutral-500">
                      {comment.user.email}
                    </span>
                    <span
                      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold ${STATUS_COLORS[comment.status]}`}
                    >
                      {STATUS_LABELS[comment.status]}
                    </span>
                  </div>

                  {/* Context: di artikel/video mana */}
                  <div className="mt-1 text-xs text-neutral-500">
                    {comment.article && (
                      <span>
                        Di artikel:{" "}
                        <Link
                          href={`/berita/${comment.article.slug}`}
                          target="_blank"
                          className="font-semibold text-brand-600 hover:underline dark:text-brand-400"
                        >
                          {comment.article.title}
                        </Link>
                      </span>
                    )}
                    {comment.video && (
                      <span>
                        Di video:{" "}
                        <Link
                          href={`/video/${comment.video.slug}`}
                          target="_blank"
                          className="font-semibold text-brand-600 hover:underline dark:text-brand-400"
                        >
                          {comment.video.title}
                        </Link>
                      </span>
                    )}
                    <span className="ml-2">
                      • {formatRelativeTime(comment.createdAt)}
                    </span>
                  </div>

                  {/* Comment content */}
                  <p className="mt-2 whitespace-pre-wrap rounded-lg bg-neutral-50 p-3 text-sm text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200">
                    {comment.content}
                  </p>

                  {/* Actions */}
                  <div className="mt-3">
                    <AdminCommentActions
                      commentId={comment.id}
                      status={comment.status}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}