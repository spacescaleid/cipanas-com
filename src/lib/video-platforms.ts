// src/lib/video-platforms.ts

import type { VideoPlatform } from "@prisma/client";

// ─── Platform Detection ──────────────────────────────────────────────────────

/**
 * Deteksi platform dari URL yang di-paste user.
 * Return null kalau platform tidak dikenali.
 */
export function detectPlatform(url: string): VideoPlatform | null {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim().toLowerCase();

  // YouTube Shorts
  if (trimmed.includes("youtube.com/shorts/")) return "YOUTUBE_SHORTS";

  // YouTube biasa
  if (
    trimmed.includes("youtube.com/watch") ||
    trimmed.includes("youtu.be/") ||
    trimmed.includes("youtube.com/embed/")
  ) {
    return "YOUTUBE";
  }

  // TikTok
  if (trimmed.includes("tiktok.com/")) return "TIKTOK";

  // Instagram
  if (
    trimmed.includes("instagram.com/reel") ||
    trimmed.includes("instagram.com/p/")
  ) {
    return "INSTAGRAM";
  }

  return null;
}

// ─── YouTube ─────────────────────────────────────────────────────────────────

export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const match = url
    .trim()
    .match(
      /(?:youtube\.com\/watch\?(?:.*&)?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/
    );
  return match?.[1] ?? null;
}

export function getYouTubeThumbnail(
  videoId: string,
  quality: "maxres" | "hq" | "mq" | "default" = "hq"
): string {
  const qualityMap = {
    maxres: "maxresdefault",
    hq: "hqdefault",
    mq: "mqdefault",
    default: "default",
  };
  return `https://img.youtube.com/vi/${videoId}/${qualityMap[quality]}.jpg`;
}

export function getYouTubeEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}?modestbranding=1&rel=0`;
}

// ─── TikTok ──────────────────────────────────────────────────────────────────

export function extractTikTokId(url: string): string | null {
  if (!url) return null;
  const match = url.trim().match(/tiktok\.com\/.*\/video\/(\d+)/);
  return match?.[1] ?? null;
}

/**
 * Embed URL TikTok.
 * Format /embed/{id} — endpoint aktif TikTok untuk iframe embed.
 * (Format lama /embed/v2/{id} juga masih works tapi format baru lebih standard).
 */
export function getTikTokEmbedUrl(videoId: string): string {
  return `https://www.tiktok.com/embed/${videoId}`;
}

/**
 * Fetch thumbnail TikTok via oEmbed API — server-side only.
 * TikTok oEmbed: https://www.tiktok.com/oembed?url={sourceUrl}
 * Response JSON punya `thumbnail_url`.
 *
 * Return null kalau gagal fetch/parse (network error, invalid URL, dsb).
 * Fungsi ini dipakai di server action saat createVideoAction.
 */
export async function fetchTikTokThumbnail(
  sourceUrl: string
): Promise<string | null> {
  try {
    const oembedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(sourceUrl)}`;
    const res = await fetch(oembedUrl, {
      // TikTok oEmbed kadang lambat — timeout 5 detik cukup
      signal: AbortSignal.timeout(5000),
      headers: {
        // UA browser normal untuk hindari rate limit / block
        "User-Agent":
          "Mozilla/5.0 (compatible; CipanasComBot/1.0; +https://cipanas.com)",
      },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { thumbnail_url?: string };
    return data.thumbnail_url ?? null;
  } catch {
    // Silent fail — thumbnail tidak wajib untuk TikTok
    return null;
  }
}

// ─── Instagram ───────────────────────────────────────────────────────────────

/**
 * Validasi URL Instagram.
 * Instagram tidak support oEmbed tanpa Meta Developer App + Access Token.
 * Solusi: author WAJIB upload thumbnail manual saat submit video Instagram.
 */
export function isValidInstagramUrl(url: string): boolean {
  if (!url) return false;
  const trimmed = url.trim().toLowerCase();
  return (
    (trimmed.includes("instagram.com/reel") ||
      trimmed.includes("instagram.com/p/")) &&
    trimmed.startsWith("https://")
  );
}

// ─── Unified Parser ──────────────────────────────────────────────────────────

export interface ParsedVideoUrl {
  platform: VideoPlatform;
  externalId: string;
  thumbnail: string | null;
}

export function parseVideoUrl(url: string): ParsedVideoUrl | null {
  const platform = detectPlatform(url);
  if (!platform) return null;

  switch (platform) {
    case "YOUTUBE":
    case "YOUTUBE_SHORTS": {
      const id = extractYouTubeId(url);
      if (!id) return null;
      return {
        platform,
        externalId: id,
        thumbnail: getYouTubeThumbnail(id, "hq"),
      };
    }

    case "TIKTOK": {
      const id = extractTikTokId(url);
      if (!id) return null;
      return {
        platform,
        externalId: id,
        // Thumbnail TikTok di-fetch async di server action via fetchTikTokThumbnail()
        // Field ini null di sini, di-set setelah oEmbed call
        thumbnail: null,
      };
    }

    case "INSTAGRAM": {
      if (!isValidInstagramUrl(url)) return null;
      // Instagram tidak ada extractable ID — pakai hash sebagai externalId
      const hash = url
        .trim()
        .replace(/[^a-zA-Z0-9]/g, "")
        .slice(-20);
      return {
        platform,
        externalId: `ig-${hash}`,
        // Thumbnail Instagram wajib di-upload manual — validasi di form/action
        thumbnail: null,
      };
    }

    default:
      return null;
  }
}

/**
 * Get embed URL berdasarkan platform.
 * Return null untuk platform yang tidak support embed (Instagram).
 */
export function getEmbedUrl(
  platform: VideoPlatform,
  externalId: string
): string | null {
  switch (platform) {
    case "YOUTUBE":
    case "YOUTUBE_SHORTS":
      return getYouTubeEmbedUrl(externalId);
    case "TIKTOK":
      return getTikTokEmbedUrl(externalId);
    case "INSTAGRAM":
      return null; // Tidak support embed — link-out
    default:
      return null;
  }
}

/**
 * Get aspect ratio class untuk embed per platform.
 */
export function getEmbedAspectClass(platform: VideoPlatform): string {
  switch (platform) {
    case "YOUTUBE":
      return "aspect-video"; // 16:9
    case "YOUTUBE_SHORTS":
    case "TIKTOK":
      return "aspect-[9/16]"; // 9:16 portrait
    default:
      return "aspect-video";
  }
}

/**
 * Label platform yang user-friendly.
 */
export const PLATFORM_LABELS: Record<VideoPlatform, string> = {
  YOUTUBE: "YouTube",
  YOUTUBE_SHORTS: "YouTube Shorts",
  TIKTOK: "TikTok",
  INSTAGRAM: "Instagram",
};

/**
 * Warna badge per platform.
 */
export const PLATFORM_COLORS: Record<VideoPlatform, string> = {
  YOUTUBE: "bg-red-100 text-red-700 border-red-200",
  YOUTUBE_SHORTS: "bg-red-100 text-red-700 border-red-200",
  TIKTOK: "bg-neutral-900 text-white border-neutral-700",
  INSTAGRAM:
    "bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border-purple-200",
};