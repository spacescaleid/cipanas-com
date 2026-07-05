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

/**
 * Extract YouTube video ID dari URL.
 * Support: watch, shorts, embed, youtu.be
 */
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

/**
 * Extract TikTok video ID dari URL.
 * Format: https://www.tiktok.com/@user/video/1234567890123456789
 * ID = angka numerik panjang.
 */
export function extractTikTokId(url: string): string | null {
  if (!url) return null;
  const match = url.trim().match(/tiktok\.com\/.*\/video\/(\d+)/);
  return match?.[1] ?? null;
}

/**
 * Embed URL TikTok — dibangun dari ID, bukan URL mentah user.
 * Ikuti pola aman: JANGAN taruh URL mentah ke src iframe.
 */
export function getTikTokEmbedUrl(videoId: string): string {
  return `https://www.tiktok.com/embed/v2/${videoId}`;
}

// ─── Instagram ───────────────────────────────────────────────────────────────

/**
 * Validasi URL Instagram.
 * Cuma cek domain — tidak extract ID karena embed resmi butuh Meta Developer App.
 *
 * Keputusan desain: Instagram ditampilkan sebagai kartu link-out
 * ("Lihat di Instagram" + ikon), bukan iframe embed.
 * Alasan: embed resmi Instagram butuh Meta Developer App + API key,
 * yang terlalu complex untuk scope ini. Ini bukan batasan teknis kita —
 * ini batasan platform (Meta restrict embed tanpa API).
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

/**
 * Parse URL video dari berbagai platform.
 * Return parsed info atau null kalau tidak valid.
 */
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
        thumbnail: null, // TikTok tidak punya thumbnail URL publik tanpa API
      };
    }

    case "INSTAGRAM": {
      if (!isValidInstagramUrl(url)) return null;
      // Instagram tidak ada ID yang bisa di-extract reliably tanpa API
      // Pakai hash URL sebagai externalId (untuk unique constraint)
      const hash = url
        .trim()
        .replace(/[^a-zA-Z0-9]/g, "")
        .slice(-20);
      return {
        platform,
        externalId: `ig-${hash}`,
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
      return null; // Tidak support embed — tampil sebagai link-out card
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
      return "aspect-[9/16]"; // 9:16 (portrait)
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