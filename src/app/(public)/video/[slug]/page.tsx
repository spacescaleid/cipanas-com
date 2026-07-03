// src/app/(public)/video/[slug]/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Eye, MessageSquare, PlayCircle, Video as VideoIcon } from "lucide-react";

import { getVideoBySlug, incrementVideoView } from "@/actions/video-actions";
import prisma from "@/lib/prisma";
import { formatDate, formatRelativeTime } from "@/lib/format";
import { getYouTubeEmbedUrl } from "@/lib/youtube";
import { serializePrisma } from "@/lib/serialize";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const video = await getVideoBySlug(slug);

  if (!video) return { title: "Video tidak ditemukan" };

  return {
    title: `${video.title} — Cipanas.com`,
    description: video.description ?? `Video: ${video.title}`,
    openGraph: {
      title: video.title,
      description: video.description ?? undefined,
      type: "video.other",
      images: video.thumbnail ? [video.thumbnail] : undefined,
    },
  };
}

async function getRelatedVideos(currentVideoId: string, limit = 6) {
  const relatedRaw = await prisma.video.findMany({
    where: {
      status: "PUBLISHED",
      NOT: { id: currentVideoId },
    },
    include: {
      author: { select: { name: true } },
    },
    orderBy: { publishedAt: "desc" },
    take: limit,
  });

  return serializePrisma(relatedRaw);
}

export default async function VideoDetailPage({ params }: Props) {
  const { slug } = await params;
  const video = await getVideoBySlug(slug);

  if (!video) notFound();

  const embedUrl = getYouTubeEmbedUrl(video.youtubeId);
  const relatedVideos = await getRelatedVideos(video.id);

  // Fire-and-forget: increment view count
  incrementVideoView(video.id).catch(() => {
    // Silent fail
  });

  return (
    <article className="animate-fade-in">
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Back link */}
        <div className="mb-4">
          <Link
            href="/video"
            className="inline-flex items-center gap-1 text-sm text-brand-600 hover:text-brand-700 dark:text-brand-400"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Video
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          {/* Main content */}
          <div className="min-w-0 space-y-6">
            {/* Video Player */}
            <div className="overflow-hidden rounded-xl border border-neutral-200 bg-black shadow-card dark:border-neutral-800">
              <div className="relative aspect-video">
                <iframe
                  src={embedUrl}
                  title={video.title}
                  className="absolute inset-0 h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>

            {/* Title + Meta */}
            <div>
              <h1 className="font-serif text-2xl font-bold leading-tight text-neutral-900 dark:text-white md:text-3xl">
                {video.title}
              </h1>

              <div className="mt-4 flex flex-wrap items-center gap-4 border-y border-neutral-200 py-4 text-sm text-neutral-600 dark:border-neutral-800 dark:text-neutral-400">
                <div className="flex items-center gap-2">
                  <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full bg-brand-100 dark:bg-brand-900/40">
                    {video.author.image ? (
                      <Image
                        src={video.author.image}
                        alt={video.author.name}
                        fill
                        sizes="32px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs font-bold text-brand-600 dark:text-brand-400">
                        {video.author.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <span className="font-semibold text-neutral-900 dark:text-white">
                    {video.author.name}
                  </span>
                </div>

                {video.publishedAt && (
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    {formatDate(video.publishedAt)}
                  </span>
                )}

                <span className="inline-flex items-center gap-1.5">
                  <Eye className="h-4 w-4" />
                  {video.viewCount} views
                </span>

                <span className="inline-flex items-center gap-1.5">
                  <MessageSquare className="h-4 w-4" />
                  {video._count.comments} komentar
                </span>
              </div>
            </div>

            {/* Description */}
            {video.description && (
              <div className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
                <h2 className="mb-2 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                  Deskripsi
                </h2>
                <p className="whitespace-pre-wrap text-sm text-neutral-700 dark:text-neutral-300">
                  {video.description}
                </p>
              </div>
            )}

            {/* Comment section placeholder (akan diisi di Iterasi 3) */}
            <div className="rounded-xl border border-dashed border-neutral-300 bg-white p-6 text-center dark:border-neutral-700 dark:bg-neutral-900">
              <MessageSquare className="mx-auto h-8 w-8 text-neutral-400" />
              <p className="mt-2 text-sm text-neutral-500">
                Fitur komentar segera hadir
              </p>
            </div>
          </div>

          {/* Sidebar: Related Videos */}
          <aside className="space-y-6">
            <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
              <h3 className="mb-4 font-serif text-lg font-bold text-neutral-900 dark:text-white">
                Video Lainnya
              </h3>

              {relatedVideos.length === 0 ? (
                <p className="text-sm text-neutral-500">
                  Belum ada video lain
                </p>
              ) : (
                <div className="space-y-3">
                  {relatedVideos.map((related) => (
                    <Link
                      key={related.id}
                      href={`/video/${related.slug}`}
                      className="group flex gap-3"
                    >
                      <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-md bg-neutral-100 dark:bg-neutral-800">
                        {related.thumbnail ? (
                          <Image
                            src={related.thumbnail}
                            alt={related.title}
                            fill
                            sizes="96px"
                            className="object-cover transition group-hover:scale-105"
                            unoptimized
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <VideoIcon className="h-6 w-6 text-neutral-400" />
                          </div>
                        )}
                        {/* Play icon overlay */}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition group-hover:bg-black/40 group-hover:opacity-100">
                          <PlayCircle className="h-6 w-6 text-white" />
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-xs font-semibold text-neutral-900 group-hover:text-brand-700 dark:text-white dark:group-hover:text-brand-400">
                          {related.title}
                        </p>
                        <p className="mt-1 text-[10px] text-neutral-500">
                          {related.author.name}
                        </p>
                        {related.publishedAt && (
                          <p className="text-[10px] text-neutral-500">
                            {formatRelativeTime(related.publishedAt)}
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              <Link
                href="/video"
                className="mt-4 block text-center text-xs font-semibold text-brand-600 hover:underline dark:text-brand-400"
              >
                Lihat Semua Video →
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </article>
  );
}