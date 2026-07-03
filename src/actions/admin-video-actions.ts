// src/actions/admin-video-actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import type { ZodError } from "zod";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rejectVideoSchema } from "@/lib/video-schema";
import type { ActionResult } from "./video-actions";
import type { VideoStatus } from "@prisma/client";

// ─── Helper: Ambil pesan error pertama dari ZodError ─────────────────────────

function getFirstZodError(error: ZodError): string {
  const issues =
    "issues" in error &&
    Array.isArray((error as unknown as { issues: unknown[] }).issues)
      ? (error as unknown as { issues: Array<{ message: string }> }).issues
      : (error as unknown as { errors: Array<{ message: string }> }).errors;

  return issues[0]?.message ?? "Input tidak valid";
}

// ─── Guard: pastikan user adalah admin ───────────────────────────────────────

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

// ─── 1. Approve Video ────────────────────────────────────────────────────────

export async function approveVideoAction(
  videoId: string
): Promise<ActionResult> {
  let adminUser;
  try {
    adminUser = await requireAdmin();
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }

  const video = await prisma.video.findUnique({
    where: { id: videoId },
    select: { id: true, slug: true, status: true, title: true },
  });

  if (!video) {
    return { success: false, error: "Video tidak ditemukan" };
  }

  if (video.status === "PUBLISHED") {
    return { success: false, error: "Video sudah dipublish sebelumnya" };
  }

  try {
    await prisma.video.update({
      where: { id: videoId },
      data: {
        status: "PUBLISHED",
        publishedAt: new Date(),
      },
    });
  } catch (err) {
    console.error("[APPROVE_VIDEO_ERROR]", err);
    return { success: false, error: "Gagal approve video" };
  }

  await prisma.activityLog.create({
    data: {
      userId: adminUser.id,
      action: "APPROVE_VIDEO",
      target: `Video:${videoId} (${video.slug})`,
    },
  });

  revalidatePath("/admin/video");
  revalidatePath(`/admin/video/${videoId}`);
  revalidatePath("/video");
  revalidatePath(`/video/${video.slug}`);
  revalidatePath("/dashboard/video");

  return { success: true, data: undefined };
}

// ─── 2. Reject Video ─────────────────────────────────────────────────────────

export async function rejectVideoAction(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  let adminUser;
  try {
    adminUser = await requireAdmin();
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }

  const parsed = rejectVideoSchema.safeParse({
    videoId: formData.get("videoId"),
    reason: formData.get("reason"),
  });

  if (!parsed.success) {
    return { success: false, error: getFirstZodError(parsed.error) };
  }

  const { videoId, reason } = parsed.data;

  const video = await prisma.video.findUnique({
    where: { id: videoId },
    select: { id: true, slug: true, status: true },
  });

  if (!video) {
    return { success: false, error: "Video tidak ditemukan" };
  }

  try {
    await prisma.video.update({
      where: { id: videoId },
      data: {
        status: "REJECTED",
        publishedAt: null,
      },
    });
  } catch (err) {
    console.error("[REJECT_VIDEO_ERROR]", err);
    return { success: false, error: "Gagal reject video" };
  }

  await prisma.activityLog.create({
    data: {
      userId: adminUser.id,
      action: "REJECT_VIDEO",
      target: `Video:${videoId} (${video.slug}) - ${reason}`,
    },
  });

  revalidatePath("/admin/video");
  revalidatePath(`/admin/video/${videoId}`);
  revalidatePath("/video");
  revalidatePath("/dashboard/video");

  return { success: true, data: undefined };
}

// ─── 3. Delete Video (admin bisa delete apapun) ──────────────────────────────

export async function adminDeleteVideoAction(
  videoId: string
): Promise<ActionResult> {
  let adminUser;
  try {
    adminUser = await requireAdmin();
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }

  const video = await prisma.video.findUnique({
    where: { id: videoId },
    select: { id: true, slug: true },
  });

  if (!video) {
    return { success: false, error: "Video tidak ditemukan" };
  }

  try {
    await prisma.video.delete({ where: { id: videoId } });
  } catch (err) {
    console.error("[ADMIN_DELETE_VIDEO_ERROR]", err);
    return { success: false, error: "Gagal hapus video" };
  }

  await prisma.activityLog.create({
    data: {
      userId: adminUser.id,
      action: "DELETE_VIDEO_ADMIN",
      target: `Video:${videoId} (${video.slug})`,
    },
  });

  revalidatePath("/admin/video");
  revalidatePath("/video");
  revalidatePath("/dashboard/video");

  return { success: true, data: undefined };
}

// ─── 4. Get All Videos for Admin (dengan filter status) ──────────────────────

export async function getAllVideosForAdmin(statusFilter?: string) {
  const validStatuses: VideoStatus[] = ["PENDING", "PUBLISHED", "REJECTED"];

  const isValidFilter =
    statusFilter && validStatuses.includes(statusFilter as VideoStatus);

  const videos = await prisma.video.findMany({
    where: isValidFilter
      ? { status: statusFilter as VideoStatus }
      : undefined,
    include: {
      author: {
        select: { id: true, name: true, email: true },
      },
      _count: {
        select: { comments: true },
      },
    },
    orderBy: [
      { status: "asc" }, // PENDING dulu (kalau ada), lalu PUBLISHED, lalu REJECTED
      { createdAt: "desc" },
    ],
  });

  return videos;
}

// ─── 5. Get Video Detail for Admin ───────────────────────────────────────────

export async function getVideoDetailForAdmin(id: string) {
  return prisma.video.findUnique({
    where: { id },
    include: {
      author: {
        select: { id: true, name: true, email: true, image: true },
      },
      _count: {
        select: { comments: true },
      },
    },
  });
}