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
import { extractYouTubeId, getYouTubeThumbnail } from "@/lib/youtube";
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

// ─── Helper: Ambil pesan error pertama dari ZodError ─────────────────────────

function getFirstZodError(error: ZodError): string {
  const issues =
    "issues" in error &&
    Array.isArray((error as unknown as { issues: unknown[] }).issues)
      ? (error as unknown as { issues: Array<{ message: string }> }).issues
      : (error as unknown as { errors: Array<{ message: string }> }).errors;

  return issues[0]?.message ?? "Input tidak valid";
}

// ─── Helper: Generate unique slug ────────────────────────────────────────────

async function generateUniqueVideoSlug(title: string): Promise<string> {
  const base = slugify(title, {
    lower: true,
    strict: true,
    locale: "id",
  });
  let slug = base;
  let counter = 1;

  while (await prisma.video.findUnique({ where: { slug } })) {
    slug = `${base}-${counter}`;
    counter += 1;
  }

  return slug;
}

// ─── Helper: Require CONTRIBUTOR/ADMIN/SUPER_ADMIN ─────────────────────────

async function requireContributorOrAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new Error("Unauthorized: harus login");
  }

  const role = session.user.role;
  if (role === "VISITOR") {
    throw new Error(
      "Forbidden: fitur upload video hanya untuk kontributor. Hubungi admin untuk akses."
    );
  }

  return session.user;
}

// ─── 1. Create Video ─────────────────────────────────────────────────────────

export async function createVideoAction(
  _prevState: ActionResult<{ slug: string }> | null,
  formData: FormData
): Promise<ActionResult<{ slug: string }>> {
  // ─── Auth check ────────────────────────────────────────
  let user;
  try {
    user = await requireContributorOrAdmin();
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }

  // ─── Rate limit check per user (bukan per IP karena user identified) ──
  try {
    const headersList = await headers();
    const ip = getClientIpFromNextHeaders(headersList);
    // Key kombinasi user + IP untuk cegah bypass rate limit dengan ganti IP
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
      "Rate limit check gagal, melanjutkan:",
      err instanceof Error ? err.message : "unknown"
    );
  }

  // ─── Parse & validasi input ─────────────────────────────
  const rawInput = {
    title: formData.get("title"),
    description: formData.get("description") ?? "",
    youtubeUrl: formData.get("youtubeUrl"),
  };

  const parsed = createVideoSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { success: false, error: getFirstZodError(parsed.error) };
  }

  const { title, description, youtubeUrl } = parsed.data;

  // ─── Extract YouTube ID ──────────────────────────────────
  const youtubeId = extractYouTubeId(youtubeUrl);
  if (!youtubeId) {
    return {
      success: false,
      error: "URL YouTube tidak valid. Pastikan URL benar.",
    };
  }

  // ─── Cek duplikat: sudah ada video dengan youtubeId ini? ──────
  const existing = await prisma.video.findUnique({
    where: { youtubeId },
  });

  if (existing) {
    return {
      success: false,
      error: "Video ini sudah pernah di-upload sebelumnya.",
    };
  }

  // ─── Sanitasi & save ─────────────────────────────────────
  const safeTitle = sanitizeText(title).trim();
  const safeDescription = description
    ? sanitizeText(description).trim() || null
    : null;

  if (safeTitle.length < 5) {
    return {
      success: false,
      error: "Judul terlalu pendek setelah sanitasi",
    };
  }

  const slug = await generateUniqueVideoSlug(safeTitle);
  const thumbnail = getYouTubeThumbnail(youtubeId, "hq");

  let video;
  try {
    video = await prisma.video.create({
      data: {
        title: safeTitle,
        slug,
        description: safeDescription,
        youtubeId,
        thumbnail,
        authorId: user.id,
        status: "PENDING",
      },
      select: { id: true, slug: true },
    });
  } catch (err) {
    console.error("[CREATE_VIDEO_ERROR]", err);
    return {
      success: false,
      error: "Gagal menyimpan video, coba lagi",
    };
  }

  // Log activity
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

  if (!video) {
    return { success: false, error: "Video tidak ditemukan" };
  }

  const isOwner = video.authorId === user.id;
  const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";

  if (!isOwner && !isAdmin) {
    return { success: false, error: "Tidak berhak menghapus video ini" };
  }

  // Kontributor tidak boleh delete video yang sudah PUBLISHED
  if (isOwner && !isAdmin && video.status === "PUBLISHED") {
    return {
      success: false,
      error:
        "Video yang sudah tayang tidak bisa dihapus sendiri. Hubungi admin.",
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

// ─── 3. Get My Videos (untuk dashboard) ──────────────────────────────────────

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
      youtubeId: true,
      thumbnail: true,
      status: true,
      viewCount: true,
      publishedAt: true,
      createdAt: true,
      _count: {
        select: { comments: true },
      },
    },
  });
}

// ─── 4. Get Video by Slug (untuk halaman public detail) ──────────────────────

export async function getVideoBySlug(slug: string) {
  const video = await prisma.video.findUnique({
    where: { slug },
    include: {
      author: {
        select: { id: true, name: true, image: true },
      },
      _count: {
        select: { comments: { where: { status: "APPROVED" } } },
      },
    },
  });

  if (!video || video.status !== "PUBLISHED") {
    return null;
  }

  return video;
}

// ─── 5. Increment Video View Count ───────────────────────────────────────────

export async function incrementVideoView(videoId: string) {
  try {
    await prisma.video.update({
      where: { id: videoId },
      data: { viewCount: { increment: 1 } },
    });
  } catch {
    // Silent fail
  }
}