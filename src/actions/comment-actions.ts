// src/actions/comment-actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { getServerSession } from "next-auth";
import type { ZodError } from "zod";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createCommentSchema } from "@/lib/comment-schema";
import { sanitizeText } from "@/lib/sanitize";
import {
  checkRateLimit,
  getClientIpFromNextHeaders,
  CREATE_COMMENT_RATE_LIMIT,
} from "@/lib/rate-limit";
import type { ActionResult } from "./video-actions";

// ─── Helper: Ambil pesan error pertama dari ZodError ─────────────────────────

function getFirstZodError(error: ZodError): string {
  const issues =
    "issues" in error &&
    Array.isArray((error as unknown as { issues: unknown[] }).issues)
      ? (error as unknown as { issues: Array<{ message: string }> }).issues
      : (error as unknown as { errors: Array<{ message: string }> }).errors;

  return issues[0]?.message ?? "Input tidak valid";
}

// ─── 1. Create Comment (untuk artikel atau video) ───────────────────────────

export async function createCommentAction(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  // ─── Auth check (wajib login) ─────────────────────────────
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return {
      success: false,
      error: "Kamu harus login untuk berkomentar",
    };
  }

  // ─── Rate limit check per user ─────────────────────────────
  try {
    const headersList = await headers();
    const ip = getClientIpFromNextHeaders(headersList);
    const rl = checkRateLimit(
      `comment:${session.user.id}:${ip}`,
      CREATE_COMMENT_RATE_LIMIT
    );

    if (!rl.success) {
      const minutesRemaining = Math.ceil(
        (rl.resetAt - Date.now()) / (60 * 1000)
      );
      return {
        success: false,
        error: `Terlalu banyak komentar. Coba lagi dalam ${minutesRemaining} menit.`,
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
    content: formData.get("content"),
    articleId: formData.get("articleId") || undefined,
    videoId: formData.get("videoId") || undefined,
  };

  const parsed = createCommentSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { success: false, error: getFirstZodError(parsed.error) };
  }

  const { content, articleId, videoId } = parsed.data;

  // ─── Verify target exists (artikel atau video) ─────────
  if (articleId) {
    const article = await prisma.article.findUnique({
      where: { id: articleId },
      select: { id: true, status: true, slug: true },
    });
    if (!article || article.status !== "PUBLISHED") {
      return { success: false, error: "Artikel tidak ditemukan" };
    }
  }

  if (videoId) {
    const video = await prisma.video.findUnique({
      where: { id: videoId },
      select: { id: true, status: true, slug: true },
    });
    if (!video || video.status !== "PUBLISHED") {
      return { success: false, error: "Video tidak ditemukan" };
    }
  }

  // ─── Sanitasi content ─────────────────────────────────
  const safeContent = sanitizeText(content).trim();

  if (safeContent.length < 3) {
    return {
      success: false,
      error: "Komentar terlalu pendek setelah sanitasi",
    };
  }

  // ─── Save ─────────────────────────────────────────────
  try {
    await prisma.comment.create({
      data: {
        userId: session.user.id,
        name: session.user.name ?? "Pengguna",
        content: safeContent,
        status: "PENDING", // Default PENDING, admin approve dulu
        articleId: articleId ?? null,
        videoId: videoId ?? null,
      },
    });
  } catch (err) {
    console.error("[CREATE_COMMENT_ERROR]", err);
    return {
      success: false,
      error: "Gagal menyimpan komentar, coba lagi",
    };
  }

  // Revalidate halaman terkait
  if (articleId) {
    const article = await prisma.article.findUnique({
      where: { id: articleId },
      select: { slug: true },
    });
    if (article) {
      revalidatePath(`/berita/${article.slug}`);
    }
  }

  if (videoId) {
    const video = await prisma.video.findUnique({
      where: { id: videoId },
      select: { slug: true },
    });
    if (video) {
      revalidatePath(`/video/${video.slug}`);
    }
  }

  revalidatePath("/admin/komentar");

  return { success: true, data: undefined };
}

// ─── 2. Delete My Comment ────────────────────────────────────────────────────

export async function deleteMyCommentAction(
  commentId: string
): Promise<ActionResult> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { success: false, error: "Kamu harus login" };
  }

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: {
      id: true,
      userId: true,
      articleId: true,
      videoId: true,
      article: { select: { slug: true } },
      video: { select: { slug: true } },
    },
  });

  if (!comment) {
    return { success: false, error: "Komentar tidak ditemukan" };
  }

  // Hanya author yang bisa delete komentarnya sendiri
  const isOwner = comment.userId === session.user.id;
  const isAdmin =
    session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN";

  if (!isOwner && !isAdmin) {
    return { success: false, error: "Tidak berhak menghapus komentar ini" };
  }

  try {
    await prisma.comment.delete({ where: { id: commentId } });
  } catch (err) {
    console.error("[DELETE_COMMENT_ERROR]", err);
    return { success: false, error: "Gagal menghapus komentar" };
  }

  // Revalidate halaman terkait
  if (comment.article) {
    revalidatePath(`/berita/${comment.article.slug}`);
  }
  if (comment.video) {
    revalidatePath(`/video/${comment.video.slug}`);
  }
  revalidatePath("/admin/komentar");

  return { success: true, data: undefined };
}

// ─── 3. Get Approved Comments (untuk halaman public) ────────────────────────

export async function getApprovedComments(params: {
  articleId?: string;
  videoId?: string;
}) {
  const { articleId, videoId } = params;

  if (!articleId && !videoId) return [];

  return prisma.comment.findMany({
    where: {
      status: "APPROVED",
      ...(articleId ? { articleId } : {}),
      ...(videoId ? { videoId } : {}),
    },
    include: {
      user: {
        select: { id: true, name: true, image: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}