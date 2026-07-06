// src/actions/video-actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getServerSession } from "next-auth";
import slugify from "slugify";
import type { ZodError } from "zod";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseVideoUrl, fetchTikTokThumbnail } from "@/lib/video-platforms";
import { createVideoSchema } from "@/lib/video-schema";
import { sanitizeText } from "@/lib/sanitize";
import {
  checkRateLimit,
  getClientIpFromNextHeaders,
  UPLOAD_VIDEO_RATE_LIMIT,
} from "@/lib/rate-limit";

// ─── Types ───────────────────────────────────────────────────────────────────

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

// ─── Helper ──────────────────────────────────────────────────────────────────

function getFirstZodError(error: ZodError): string {
  const issues =
    "issues" in error &&
    Array.isArray((error as unknown as { issues: unknown[] }).issues)
      ? (error as unknown as { issues: Array<{ message: string }> }).issues
      : (error as unknown as { errors: Array<{ message: string }> }).errors;
  return issues[0]?.message ?? "Input tidak valid";
}

async function generateUniqueVideoSlug(title: string): Promise<string> {
  const base = slugify(title, { lower: true, strict: true, locale: "id" });
  let slug = base;
  let counter = 1;
  while (await prisma.video.findUnique({ where: { slug } })) {
    slug = `${base}-${counter}`;
    counter += 1;
  }
  return slug;
}

async function requireContributorOrAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized: harus login");
  if (session.user.role === "VISITOR") {
    throw new Error("Forbidden: fitur upload video hanya untuk kontributor.");
  }
  return session.user;
}

// ─── 1. Create Video ─────────────────────────────────────────────────────────

export async function createVideoAction(
  _prevState: ActionResult<{ slug: string }> | null,
  formData: FormData
): Promise<ActionResult<{ slug: string }>> {
  let user;
  try {
    user = await requireContributorOrAdmin();
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }

  // Rate limit
  try {
    const headersList = await headers();
    const ip = getClientIpFromNextHeaders(headersList);
    const rl = checkRateLimit(
      `upload-video:${user.id}:${ip}`,
      UPLOAD_VIDEO_RATE_LIMIT
    );
    if (!rl.success) {
      const hoursRemaining = Math.ceil(
        (rl.resetAt - Date.now()) / (60 * 60 * 1000)
      );
      return {
        success: false,
        error: `Batas upload video tercapai (3 per hari). Coba lagi dalam ${hoursRemaining} jam.`,
      };
    }
  } catch (err) {
    console.warn(
      "Rate limit check gagal:",
      err instanceof Error ? err.message : "unknown"
    );
  }

  // Parse input
  const rawInput = {
    title: formData.get("title"),
    description: formData.get("description") ?? "",
    videoUrl: formData.get("videoUrl"),
    thumbnailUrl: formData.get("thumbnailUrl") ?? "",
  };

  const parsed = createVideoSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { success: false, error: getFirstZodError(parsed.error) };
  }

  const { title, description, videoUrl, thumbnailUrl } = parsed.data;

  // Parse URL → detect platform + extract ID
  const parsedVideo = parseVideoUrl(videoUrl);
  if (!parsedVideo) {
    return {
      success: false,
      error:
        "URL video tidak valid. Pastikan URL dari YouTube, TikTok, atau Instagram.",
    };
  }

  // Cek duplikat
  const existing = await prisma.video.findUnique({
    where: {
      platform_externalId: {
        platform: parsedVideo.platform,
        externalId: parsedVideo.externalId,
      },
    },
  });
  if (existing) {
    return {
      success: false,
      error: "Video ini sudah pernah di-upload sebelumnya.",
    };
  }

  // Sanitasi
  const safeTitle = sanitizeText(title).trim();
  const safeDescription = description
    ? sanitizeText(description).trim() || null
    : null;
  if (safeTitle.length < 5) {
    return { success: false, error: "Judul terlalu pendek setelah sanitasi" };
  }

  // ── Resolve final thumbnail per platform ────────────────────────────────
  // YouTube → dari parseVideoUrl (ytimg.com)
  // TikTok → fetch oEmbed API server-side (async, boleh gagal)
  // Instagram → WAJIB dari thumbnailUrl manual upload (validasi di sini)
  let finalThumbnail: string | null = parsedVideo.thumbnail;

  if (parsedVideo.platform === "TIKTOK") {
    // Fetch async — kalau gagal, thumbnail tetap null (fallback ke ikon)
    const tiktokThumb = await fetchTikTokThumbnail(videoUrl);
    if (tiktokThumb) {
      finalThumbnail = tiktokThumb;
    } else if (thumbnailUrl) {
      // Author juga bisa opsional upload thumbnail manual untuk TikTok
      // sebagai fallback kalau oEmbed gagal
      finalThumbnail = thumbnailUrl;
    }
  }

  if (parsedVideo.platform === "INSTAGRAM") {
    // Wajib: Instagram tidak bisa auto-fetch thumbnail
    if (!thumbnailUrl) {
      return {
        success: false,
        error:
          "Video Instagram butuh thumbnail manual. Silakan upload gambar thumbnail dulu.",
      };
    }
    finalThumbnail = thumbnailUrl;
  }

  const slug = await generateUniqueVideoSlug(safeTitle);

  let video;
  try {
    video = await prisma.video.create({
      data: {
        title: safeTitle,
        slug,
        description: safeDescription,
        platform: parsedVideo.platform,
        externalId: parsedVideo.externalId,
        sourceUrl: videoUrl,
        thumbnail: finalThumbnail,
        authorId: user.id,
        status: "PENDING",
      },
      select: { id: true, slug: true },
    });
  } catch (err) {
    console.error("[CREATE_VIDEO_ERROR]", err);
    return { success: false, error: "Gagal menyimpan video, coba lagi" };
  }

  await prisma.activityLog.create({
    data: {
      userId: user.id,
      action: "SUBMIT_VIDEO",
      target: `Video:${video.id} (${slug})`,
    },
  });

  revalidatePath("/dashboard/video");
  revalidatePath("/admin/video");

  redirect(`/dashboard/video?submitted=${slug}`);
}

// ─── 2. Delete My Video ──────────────────────────────────────────────────────

export async function deleteMyVideoAction(
  videoId: string
): Promise<ActionResult> {
  let user;
  try {
    user = await requireContributorOrAdmin();
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }

  const video = await prisma.video.findUnique({
    where: { id: videoId },
    select: { id: true, authorId: true, slug: true, status: true },
  });
  if (!video) return { success: false, error: "Video tidak ditemukan" };

  const isOwner = video.authorId === user.id;
  const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";
  if (!isOwner && !isAdmin)
    return { success: false, error: "Tidak berhak menghapus video ini" };
  if (isOwner && !isAdmin && video.status === "PUBLISHED") {
    return {
      success: false,
      error: "Video yang sudah tayang tidak bisa dihapus sendiri.",
    };
  }

  try {
    await prisma.video.delete({ where: { id: videoId } });
  } catch (err) {
    console.error("[DELETE_VIDEO_ERROR]", err);
    return { success: false, error: "Gagal menghapus video" };
  }

  await prisma.activityLog.create({
    data: {
      userId: user.id,
      action: "DELETE_VIDEO",
      target: `Video:${videoId} (${video.slug})`,
    },
  });

  revalidatePath("/dashboard/video");
  revalidatePath("/admin/video");
  revalidatePath("/video");

  return { success: true, data: undefined };
}

// ─── 3. Get My Videos ────────────────────────────────────────────────────────

export async function getMyVideos() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return [];

  return prisma.video.findMany({
    where: { authorId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      platform: true,
      externalId: true,
      thumbnail: true,
      status: true,
      viewCount: true,
      publishedAt: true,
      createdAt: true,
      _count: { select: { comments: true } },
    },
  });
}

// ─── 4. Get Video by Slug ────────────────────────────────────────────────────

export async function getVideoBySlug(slug: string) {
  const video = await prisma.video.findUnique({
    where: { slug },
    include: {
      author: { select: { id: true, name: true, image: true } },
      _count: { select: { comments: { where: { status: "APPROVED" } } } },
    },
  });
  if (!video || video.status !== "PUBLISHED") return null;
  return video;
}

// ─── 5. Increment View ──────────────────────────────────────────────────────

export async function incrementVideoView(videoId: string) {
  try {
    await prisma.video.update({
      where: { id: videoId },
      data: { viewCount: { increment: 1 } },
    });
  } catch {
    // Silent
  }
}