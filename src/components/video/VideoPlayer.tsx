"use client";

import { PlayCircle, ExternalLink } from "lucide-react";
import type { VideoPlatform } from "@prisma/client";

interface VideoPlayerProps {
  platform: VideoPlatform;
  externalId: string;
  sourceUrl: string;
  thumbnail?: string | null;
  title: string;
}

export function VideoPlayer({
  platform,
  externalId,
  sourceUrl,
  title,
}: VideoPlayerProps) {
  // YouTube (biasa + Shorts): iframe embed, aspect 16:9, full width
  if (platform === "YOUTUBE" || platform === "YOUTUBE_SHORTS") {
    const embedUrl = `https://www.youtube.com/embed/${externalId}`;
    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black">
        <iframe
          src={embedUrl}
          title={title}
          className="absolute inset-0 h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    );
  }

  // TikTok: iframe embed, aspect 9:16 vertikal, di-center supaya tidak ada black void di container lebar
  if (platform === "TIKTOK") {
    const embedUrl = `https://www.tiktok.com/embed/v2/${externalId}`;
    return (
      <div className="flex w-full justify-center">
        <div className="relative aspect-[9/16] w-full max-w-md overflow-hidden rounded-2xl bg-black shadow-lg">
          <iframe
            src={embedUrl}
            title={title}
            className="absolute inset-0 h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            scrolling="no"
          />
        </div>
      </div>
    );
  }

  // Instagram: link-out card (embed Instagram tidak reliable)
  if (platform === "INSTAGRAM") {
    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-neutral-900">
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-purple-600 to-pink-500">
          <div className="mb-4 rounded-full bg-white p-6">
            <PlayCircle className="h-16 w-16 text-pink-600" />
          </div>
          <p className="mb-4 text-center text-sm text-white">
            Video ini di-host di Instagram
          </p>
          <a
            href={sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-purple-600 shadow-lg transition-shadow hover:shadow-xl"
          >
            <ExternalLink className="h-4 w-4" />
            Lihat di Instagram
          </a>
        </div>
      </div>
    );
  }

  // Fallback: platform tidak dikenal
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-neutral-200 dark:bg-neutral-800">
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className="mb-4 text-center text-sm text-neutral-700 dark:text-neutral-300">
          Platform video ({String(platform)}) tidak didukung untuk diputar
          langsung di sini.
        </p>
        <a
          href={sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:bg-neutral-800"
        >
          <ExternalLink className="h-4 w-4" />
          Buka Video
        </a>
      </div>
    </div>
  );
}