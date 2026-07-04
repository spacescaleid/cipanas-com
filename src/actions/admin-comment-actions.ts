// src/actions/admin-comment-actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { ActionResult } from "./video-actions";
import type { CommentStatus } from "@prisma/client";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    throw new Error("Unauthorized: tidak login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
    throw new Error("Forbidden: bukan admin");
  }

  return user;
}

export async function approveCommentAction(
  commentId: string
): Promise<ActionResult> {
  let adminUser;
  try {
    adminUser = await requireAdmin();
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: {
      id: true,
      article: { select: { slug: true } },
      video: { select: { slug: true } },
    },
  });

  if (!comment) {
    return { success: false, error: "Komentar tidak ditemukan" };
  }

  try {
    await prisma.comment.update({
      where: { id: commentId },
      data: { status: "APPROVED" },
    });
  } catch (err) {
    console.error("[APPROVE_COMMENT_ERROR]", err);
    return { success: false, error: "Gagal approve komentar" };
  }

  await prisma.activityLog.create({
    data: {
      userId: adminUser.id,
      action: "APPROVE_COMMENT",
      target: `Comment:${commentId}`,
    },
  });

  if (comment.article) revalidatePath(`/berita/${comment.article.slug}`);
  if (comment.video) revalidatePath(`/video/${comment.video.slug}`);
  revalidatePath("/admin/komentar");

  return { success: true, data: undefined };
}

export async function markCommentAsSpamAction(
  commentId: string
): Promise<ActionResult> {
  let adminUser;
  try {
    adminUser = await requireAdmin();
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: {
      id: true,
      article: { select: { slug: true } },
      video: { select: { slug: true } },
    },
  });

  if (!comment) {
    return { success: false, error: "Komentar tidak ditemukan" };
  }

  try {
    await prisma.comment.update({
      where: { id: commentId },
      data: { status: "SPAM" },
    });
  } catch (err) {
    console.error("[MARK_SPAM_ERROR]", err);
    return { success: false, error: "Gagal mark spam" };
  }

  await prisma.activityLog.create({
    data: {
      userId: adminUser.id,
      action: "MARK_COMMENT_SPAM",
      target: `Comment:${commentId}`,
    },
  });

  if (comment.article) revalidatePath(`/berita/${comment.article.slug}`);
  if (comment.video) revalidatePath(`/video/${comment.video.slug}`);
  revalidatePath("/admin/komentar");

  return { success: true, data: undefined };
}

export async function adminDeleteCommentAction(
  commentId: string
): Promise<ActionResult> {
  let adminUser;
  try {
    adminUser = await requireAdmin();
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: {
      id: true,
      article: { select: { slug: true } },
      video: { select: { slug: true } },
    },
  });

  if (!comment) {
    return { success: false, error: "Komentar tidak ditemukan" };
  }

  try {
    await prisma.comment.delete({ where: { id: commentId } });
  } catch (err) {
    console.error("[DELETE_COMMENT_ADMIN_ERROR]", err);
    return { success: false, error: "Gagal hapus komentar" };
  }

  await prisma.activityLog.create({
    data: {
      userId: adminUser.id,
      action: "DELETE_COMMENT_ADMIN",
      target: `Comment:${commentId}`,
    },
  });

  if (comment.article) revalidatePath(`/berita/${comment.article.slug}`);
  if (comment.video) revalidatePath(`/video/${comment.video.slug}`);
  revalidatePath("/admin/komentar");

  return { success: true, data: undefined };
}

export async function getAllCommentsForAdmin(statusFilter?: string) {
  const validStatuses: CommentStatus[] = ["PENDING", "APPROVED", "SPAM"];

  const isValidFilter =
    statusFilter && validStatuses.includes(statusFilter as CommentStatus);

  const comments = await prisma.comment.findMany({
    where: isValidFilter
      ? { status: statusFilter as CommentStatus }
      : undefined,
    include: {
      user: {
        select: { id: true, name: true, email: true, image: true },
      },
      article: {
        select: { id: true, title: true, slug: true },
      },
      video: {
        select: { id: true, title: true, slug: true },
      },
    },
    orderBy: [
      { status: "asc" },
      { createdAt: "desc" },
    ],
  });

  return comments;
}