// src/app/(public)/video/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { PlayCircle, Video as VideoIcon, Clock, Eye, MessageSquare } from "lucide-react";

import prisma from "@/lib/prisma";
import { formatRelativeTime } from "@/lib/format";
import { serializePrisma } from "@/lib/serialize";
import {
  getPaginationMeta,
  parsePageParam,
  DEFAULT_ITEMS_PER_PAGE,
} from "@/lib/pagination";
import { Pagination } from "@/components/ui/Pagination";
import { PLATFORM_LABELS } from "@/lib/video-platforms";

export const metadata: Metadata = {
  title: "Video — Cipanas.com",
  description: "Kumpulan video berita dan liputan seputar Cipanas.",
};

export const revalidate = 300;

interface Props {
  searchParams: Promise<{ page?: string }>;
}

async function getPublishedVideosPaginated(page: number) {
  const [videosRaw, totalCount] = await Promise.all([
    prisma.video.findMany({
      where: { status: "PUBLISHED" },
      include: {
        author: {
          select: { id: true, name: true },
        },
        _count: {
          select: {
            comments: { where: { status: "APPROVED" } },
          },
        },
      },
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * DEFAULT_ITEMS_PER_PAGE,
      take: DEFAULT_ITEMS_PER_PAGE,
    }),
    prisma.video.count({
      where: { status: "PUBLISHED" },
    }),
  ]);

  return {
    videos: serializePrisma(videosRaw),
    totalCount,
  };
}

export default async function VideoPage({ searchParams }: Props) {
  const params = await searchParams;
  const currentPage = parsePageParam(params.page);

  const { videos, totalCount } = await getPublishedVideosPaginated(currentPage);

  const paginationMeta = getPaginationMeta({
    currentPage,
    totalItems: totalCount,
    itemsPerPage: DEFAULT_ITEMS_PER_PAGE,
  });

  return (
    <div className="animate-fade-in">
      <div className="mx-auto max-w-7xl px-4 py-10">
        {/* Header */}
        <div className="mb-8 border-b border-neutral-200 pb-6 dark:border-neutral-800">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
            Video
          </div>
          <h1 className="font-serif text-4xl font-bold text-neutral-900 dark:text-white md:text-5xl">
            Video Berita
          </h1>
          <p className="mt-3 text-neutral-600 dark:text-neutral-400">
            Kumpulan liputan video Cipanas.com dari berbagai kontributor
          </p>
        </div>

        {/* Empty state */}
        {totalCount === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-neutral-300 p-12 text-center dark:border-neutral-700">
            <VideoIcon className="mx-auto h-12 w-12 text-neutral-400" />
            <h3 className="mt-4 font-serif text-lg font-bold text-neutral-900 dark:text-white">
              Belum ada video yang tayang
            </h3>
            <p className="mt-1 text-sm text-neutral-500">
              Video-video menarik akan tampil di sini setelah di-upload oleh
              kontributor dan disetujui admin.
            </p>
            <Link
              href="/dashboard/video/tambah"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
            >
              <PlayCircle className="h-4 w-4" />
              Upload Video Pertama
            </Link>
          </div>
        ) : (
          <>
            {/* Grid videos */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {videos.map((video) => (
                <Link
                  key={video.id}
                  href={`/video/${video.slug}`}
                  className="group cursor-pointer overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-card transition hover:shadow-card-hover dark:border-neutral-800 dark:bg-neutral-900"
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                    {video.thumbnail ? (
                      <Image
                        src={video.thumbnail}
                        alt={video.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition duration-500 group-hover:scale-105"
                        unoptimized
                      />
                    ) : (
                      <div
                        className={`flex h-full flex-col items-center justify-center gap-2 ${
                          video.platform === "TIKTOK"
                            ? "bg-neutral-900"
                            : video.platform === "INSTAGRAM"
                            ? "bg-gradient-to-br from-purple-600 to-pink-500"
                            : "bg-neutral-200 dark:bg-neutral-700"
                        }`}
                      >
                        <VideoIcon
                          className={`h-12 w-12 ${
                            video.platform === "TIKTOK" ||
                            video.platform === "INSTAGRAM"
                              ? "text-white"
                              : "text-neutral-400"
                          }`}
                        />
                        <span
                          className={`text-xs font-semibold ${
                            video.platform === "TIKTOK" ||
                            video.platform === "INSTAGRAM"
                              ? "text-white"
                              : "text-neutral-500"
                          }`}
                        >
                          {PLATFORM_LABELS[video.platform]}
                        </span>
                      </div>
                    )}
                    {/* Play overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition group-hover:opacity-100">
                      <PlayCircle className="h-16 w-16 text-white drop-shadow-lg" />
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <h3 className="line-clamp-2 font-serif text-base font-bold leading-snug text-neutral-900 group-hover:text-brand-700 dark:text-white dark:group-hover:text-brand-400">
                      {video.title}
                    </h3>

                    {/* Meta */}
                    <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-500">
                      <span>{video.author.name}</span>
                      {video.publishedAt && (
                        <>
                          <span>•</span>
                          <span className="inline-flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatRelativeTime(video.publishedAt)}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="mt-2 flex items-center gap-3 text-xs text-neutral-500">
                      <span className="inline-flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {video.viewCount}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        {video._count.comments}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            <Pagination
              meta={paginationMeta}
              basePath="/video"
              label="video"
            />

            {/* Footer CTA */}
            <div className="mt-10 rounded-xl border border-dashed border-neutral-300 p-6 text-center dark:border-neutral-700">
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Punya video menarik seputar Cipanas?
              </p>
              <Link
                href="/dashboard/video/tambah"
                className="mt-2 inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
              >
                <PlayCircle className="h-4 w-4" />
                Upload Video Kamu
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}