// src/app/dashboard/video/page.tsx
import Link from "next/link";
import Image from "next/image";
import { Plus, Video as VideoIcon, Clock, Eye, MessageSquare } from "lucide-react";

import { requireRole } from "@/lib/auth-utils";
import { getMyVideos } from "@/actions/video-actions";
import { formatRelativeTime } from "@/lib/format";
import { VIDEO_STATUS_LABELS, VIDEO_STATUS_COLORS } from "@/types/video";
import { PLATFORM_LABELS, PLATFORM_COLORS } from "@/lib/video-platforms";
import { DeleteVideoButton } from "./DeleteVideoButton";

interface Props {
  searchParams: Promise<{ submitted?: string }>;
}

export default async function MyVideosPage({ searchParams }: Props) {
  await requireRole(["CONTRIBUTOR", "ADMIN", "SUPER_ADMIN"]);
  const { submitted } = await searchParams;
  const videos = await getMyVideos();

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-neutral-900 dark:text-white">
            Video Saya
          </h1>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            Kelola video yang kamu upload ke Cipanas.com
          </p>
        </div>
        <Link
          href="/dashboard/video/tambah"
          className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          <Plus className="h-4 w-4" />
          Tambah Video
        </Link>
      </div>

      {submitted && (
        <div className="mb-6 rounded-xl border-l-4 border-green-500 bg-green-50 p-4 dark:bg-green-900/20">
          <p className="text-sm font-semibold text-green-900 dark:text-green-100">
            ✅ Video berhasil dikirim untuk review!
          </p>
          <p className="mt-0.5 text-xs text-green-700 dark:text-green-300">
            Admin akan mereview video kamu dalam 1×24 jam.
          </p>
        </div>
      )}

      <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
        <p className="text-xs text-blue-800 dark:text-blue-200">
          💡 <strong>Batas upload:</strong> maksimal 3 video per hari.
          Support YouTube, TikTok, dan Instagram.
        </p>
      </div>

      {videos.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-neutral-300 p-12 text-center dark:border-neutral-700">
          <VideoIcon className="mx-auto h-12 w-12 text-neutral-400" />
          <h3 className="mt-4 font-serif text-lg font-bold text-neutral-900 dark:text-white">
            Belum ada video
          </h3>
          <p className="mt-1 text-sm text-neutral-500">
            Mulai bagikan video favorit kamu untuk warga Cipanas.
          </p>
          <Link
            href="/dashboard/video/tambah"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
          >
            <Plus className="h-4 w-4" />
            Upload Video Pertama
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((video) => {
            const statusColor = VIDEO_STATUS_COLORS[video.status];
            const platformColor = PLATFORM_COLORS[video.platform];

            return (
              <div
                key={video.id}
                className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-card transition hover:shadow-card-hover dark:border-neutral-800 dark:bg-neutral-900"
              >
                <div className="relative aspect-video overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                  {video.thumbnail && (
                    <Image
                      src={video.thumbnail}
                      alt={video.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover"
                      unoptimized
                    />
                  )}
                  <div className="absolute right-2 top-2 flex gap-1">
                    <span
                      className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-semibold ${platformColor}`}
                    >
                      {PLATFORM_LABELS[video.platform]}
                    </span>
                    <span
                      className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-semibold ${statusColor.bg} ${statusColor.text} ${statusColor.border}`}
                    >
                      {VIDEO_STATUS_LABELS[video.status]}
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  {video.status === "PUBLISHED" ? (
                    <Link href={`/video/${video.slug}`} target="_blank">
                      <h3 className="line-clamp-2 font-serif text-sm font-bold leading-snug text-neutral-900 hover:text-brand-700 dark:text-white">
                        {video.title}
                      </h3>
                    </Link>
                  ) : (
                    <h3 className="line-clamp-2 font-serif text-sm font-bold leading-snug text-neutral-900 dark:text-white">
                      {video.title}
                    </h3>
                  )}

                  <div className="mt-3 flex items-center gap-3 text-xs text-neutral-500">
                    {video.status === "PUBLISHED" && (
                      <>
                        <span className="inline-flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {video.viewCount}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          {video._count.comments}
                        </span>
                      </>
                    )}
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatRelativeTime(video.createdAt)}
                    </span>
                  </div>

                  {video.status !== "PUBLISHED" && (
                    <div className="mt-3 border-t border-neutral-100 pt-3 dark:border-neutral-800">
                      <DeleteVideoButton
                        videoId={video.id}
                        videoTitle={video.title}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}