// src/lib/youtube.ts

/**
 * Extract YouTube video ID dari berbagai format URL.
 * Support format:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://www.youtube.com/shorts/VIDEO_ID
 * - https://m.youtube.com/watch?v=VIDEO_ID
 */
export function extractYouTubeId(url: string): string | null {
  if (!url || typeof url !== "string") return null;

  const trimmed = url.trim();

  // Pattern regex untuk berbagai format YouTube URL
  const patterns = [
    // youtube.com/watch?v=VIDEO_ID (dengan atau tanpa parameter lain)
    /(?:youtube\.com\/watch\?(?:.*&)?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Generate URL thumbnail YouTube dari video ID.
 * Quality options:
 * - "maxres" (1280×720) — belum tentu ada untuk semua video
 * - "hq" (480×360) — selalu ada, quality bagus
 * - "mq" (320×180) — medium quality
 * - "default" (120×90) — thumbnail terkecil
 */
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

/**
 * Generate URL embed YouTube untuk iframe.
 * Support parameter tambahan (autoplay, controls, dll).
 */
export function getYouTubeEmbedUrl(
  videoId: string,
  options: {
    autoplay?: boolean;
    controls?: boolean;
    modestBranding?: boolean;
    rel?: boolean;
  } = {}
): string {
  const params = new URLSearchParams();

  if (options.autoplay) params.set("autoplay", "1");
  if (options.controls === false) params.set("controls", "0");
  if (options.modestBranding !== false) params.set("modestbranding", "1");
  if (options.rel === false) params.set("rel", "0");

  const query = params.toString();
  return `https://www.youtube.com/embed/${videoId}${query ? "?" + query : ""}`;
}

/**
 * Validasi apakah URL adalah YouTube URL yang valid.
 */
export function isValidYouTubeUrl(url: string): boolean {
  return extractYouTubeId(url) !== null;
}