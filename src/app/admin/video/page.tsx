// src/app/admin/video/page.tsx
import Link from "next/link";
import Image from "next/image";
import { Video as VideoIcon } from "lucide-react";
import type { VideoStatus } from "@prisma/client";

import { requireRole } from "@/lib/auth-utils";
import { getAllVideosForAdmin } from "@/actions/admin-video-actions";
import { formatRelativeTime } from "@/lib/format";
import { VIDEO_STATUS_LABELS, VIDEO_STATUS_COLORS } from "@/types/video";

interface Props {
  searchParams: Promise<{ status?: string }>;
}

const ALL_STATUSES: VideoStatus[] = ["PENDING", "PUBLISHED", "REJECTED"];

export default async function AdminVideoPage({ searchParams }: Props) {
  await requireRole(["ADMIN", "SUPER_ADMIN"]);
  const { status: statusFilter } = await searchParams;
  const activeFilter = statusFilter ?? "ALL";

  const videos = await getAllVideosForAdmin(
    activeFilter !== "ALL" ? activeFilter : undefined
  );

  const pendingCount = videos.filter((v) => v.status === "PENDING").length;

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-neutral-900 dark:text-white">
            Kelola Video
          </h1>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            Moderasi video yang di-upload kontributor
          </p>
        </div>
      </div>

      {pendingCount > 0 && activeFilter !== "PENDING" && (
        <div className="mb-6 rounded-xl border-l-4 border-amber-500 bg-amber-50 p-4 dark:bg-amber-900/20">
          <p className="text-sm font-semibold text-neutral-900 dark:text-white">
            ⏰ Ada {pendingCount} video menunggu review
          </p>
          <Link
            href="/admin/video?status=PENDING"
            className="mt-1 inline-block text-xs font-semibold text-amber-700 hover:underline dark:text-amber-300"
          >
            Review sekarang →
          </Link>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="mb-6 flex flex-wrap gap-2">
        <Link
          href="/admin/video"
          className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
            activeFilter === "ALL"
              ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
              : "border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400"
          }`}
        >
          Semua ({videos.length})
        </Link>
        {ALL_STATUSES.map((status) => {
          const count =
            activeFilter === status
              ? videos.length
              : videos.filter((v) => v.status === status).length;
          return (
            <Link
              key={status}
              href={`/admin/video?status=${status}`}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                activeFilter === status
                  ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                  : "border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400"
              }`}
            >
              {VIDEO_STATUS_LABELS[status]}
              {status === "PENDING" && count > 0 && activeFilter !== status && (
                <span className="ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-100 px-1 text-xs font-bold text-red-700">
                  {count}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* List */}
      {videos.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-neutral-300 p-12 text-center dark:border-neutral-700">
          <VideoIcon className="mx-auto h-12 w-12 text-neutral-400" />
          <p className="mt-4 text-sm text-neutral-500">
            Tidak ada video dengan filter ini
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
          <table className="w-full text-sm">
            <thead className="border-b border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                  Video
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                  Pengunggah
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                  Dibuat
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {videos.map((video) => {
                const statusColor = VIDEO_STATUS_COLORS[video.status];
                return (
                  <tr
                    key={video.id}
                    className="hover:bg-neutral-50 dark:hover:bg-neutral-800/30"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {video.thumbnail && (
                          <div className="relative h-14 w-24 shrink-0 overflow-hidden rounded-md bg-neutral-100">
                            <Image
                              src={video.thumbnail}
                              alt={video.title}
                              fill
                              sizes="96px"
                              className="object-cover"
                              unoptimized
                            />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="line-clamp-2 font-medium text-neutral-900 dark:text-white">
                            {video.title}
                          </p>
                          <p className="text-xs text-neutral-500">
                            {video._count.comments} komentar
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-neutral-900 dark:text-white">
                        {video.author.name}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {video.author.email}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold ${statusColor.bg} ${statusColor.text} ${statusColor.border}`}
                      >
                        {VIDEO_STATUS_LABELS[video.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-neutral-500">
                      {formatRelativeTime(video.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/video/${video.id}`}
                        className="text-xs font-semibold text-brand-600 hover:underline dark:text-brand-400"
                      >
                        Detail →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}