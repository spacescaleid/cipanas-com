// src/app/admin/video/[id]/page.tsx
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Eye, MessageSquare, ExternalLink } from "lucide-react";

import { requireRole } from "@/lib/auth-utils";
import { getVideoDetailForAdmin } from "@/actions/admin-video-actions";
import { formatDate } from "@/lib/format";
import { getEmbedUrl, getEmbedAspectClass, PLATFORM_LABELS, PLATFORM_COLORS } from "@/lib/video-platforms";
import { VIDEO_STATUS_LABELS, VIDEO_STATUS_COLORS } from "@/types/video";
import { AdminVideoActions } from "./AdminVideoActions";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminVideoDetailPage({ params }: Props) {
  await requireRole(["ADMIN", "SUPER_ADMIN"]);
  const { id } = await params;
  const video = await getVideoDetailForAdmin(id);

  if (!video) notFound();

  const statusColor = VIDEO_STATUS_COLORS[video.status];
  const platformColor = PLATFORM_COLORS[video.platform];
  const embedUrl = getEmbedUrl(video.platform, video.externalId);
  const aspectClass = getEmbedAspectClass(video.platform);

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/video"
          className="inline-flex items-center gap-1 text-sm text-brand-600 hover:text-brand-700 dark:text-brand-400"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Kelola Video
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          {/* Video Preview */}
          <div className="overflow-hidden rounded-xl border border-neutral-200 bg-black dark:border-neutral-800">
            {embedUrl ? (
              <div className={`relative ${aspectClass} max-h-[500px]`}>
                <iframe
                  src={embedUrl}
                  title={video.title}
                  className="absolute inset-0 h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              // Instagram — link-out card
              <div className="flex flex-col items-center justify-center gap-4 p-12 text-center">
                <div className="rounded-full bg-gradient-to-br from-purple-500 to-pink-500 p-4">
                  <ExternalLink className="h-8 w-8 text-white" />
                </div>
                <p className="text-sm text-neutral-400">
                  Video ini di-host di Instagram
                </p>
                <a
                  href={video.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90"
                >
                  <ExternalLink className="h-4 w-4" />
                  Lihat di Instagram
                </a>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
            <div className="mb-3 flex items-start justify-between gap-4">
              <h1 className="font-serif text-2xl font-bold text-neutral-900 dark:text-white">
                {video.title}
              </h1>
              <div className="flex shrink-0 gap-2">
                <span className={`inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-semibold ${platformColor}`}>
                  {PLATFORM_LABELS[video.platform]}
                </span>
                <span className={`inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-semibold ${statusColor.bg} ${statusColor.text} ${statusColor.border}`}>
                  {VIDEO_STATUS_LABELS[video.status]}
                </span>
              </div>
            </div>

            {video.description && (
              <div className="mb-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Deskripsi</p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-neutral-700 dark:text-neutral-300">
                  {video.description}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 border-t border-neutral-100 pt-4 text-sm dark:border-neutral-800">
              <div>
                <p className="text-xs text-neutral-500">Platform</p>
                <p className="font-medium text-neutral-900 dark:text-white">
                  {PLATFORM_LABELS[video.platform]}
                </p>
              </div>
              <div>
                <p className="text-xs text-neutral-500">External ID</p>
                <p className="font-mono text-xs text-neutral-900 dark:text-white">
                  {video.externalId}
                </p>
              </div>
              <div>
                <p className="text-xs text-neutral-500">Source URL</p>
                <a
                  href={video.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-brand-600 hover:underline break-all"
                >
                  {video.sourceUrl}
                </a>
              </div>
              <div>
                <p className="text-xs text-neutral-500">Slug</p>
                <p className="font-mono text-xs text-neutral-900 dark:text-white">{video.slug}</p>
              </div>
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">Pengunggah</h3>
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-brand-100">
                {video.author.image ? (
                  <Image src={video.author.image} alt={video.author.name} fill sizes="40px" className="object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm font-bold text-brand-600">
                    {video.author.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate font-semibold text-neutral-900 dark:text-white">{video.author.name}</p>
                <p className="truncate text-xs text-neutral-500">{video.author.email}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">Statistik</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400"><Eye className="h-4 w-4" /> Views</span>
                <span className="font-semibold text-neutral-900 dark:text-white">{video.viewCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400"><MessageSquare className="h-4 w-4" /> Komentar</span>
                <span className="font-semibold text-neutral-900 dark:text-white">{video._count.comments}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400"><Calendar className="h-4 w-4" /> Dibuat</span>
                <span className="text-xs text-neutral-700 dark:text-neutral-300">{formatDate(video.createdAt)}</span>
              </div>
              {video.publishedAt && (
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400"><Calendar className="h-4 w-4" /> Tayang</span>
                  <span className="text-xs text-neutral-700 dark:text-neutral-300">{formatDate(video.publishedAt)}</span>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">Aksi Admin</h3>
            <AdminVideoActions videoId={video.id} status={video.status} />
          </div>
        </aside>
      </div>
    </div>
  );
}