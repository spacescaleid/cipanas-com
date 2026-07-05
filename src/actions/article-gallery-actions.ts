// src/actions/article-gallery-actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  uploadArticleImage,
  deleteAdImage,
} from "@/lib/cloudinary-upload";
import {
  addGalleryImageSchema,
  updateCaptionSchema,
} from "@/lib/article-gallery-schema";
import { sanitizeText } from "@/lib/sanitize";
import {
  checkRateLimit,
  getClientIpFromNextHeaders,
  UPLOAD_GALLERY_RATE_LIMIT,
} from "@/lib/rate-limit";

// ─── Types ───────────────────────────────────────────────────────────────────

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

// ─── Helper: Cek ownership (penulis ATAU admin) ─────────────────────────────

async function requireArticleAccess(articleId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new Error("Unauthorized: harus login");
  }

  const article = await prisma.article.findUnique({
    where: { id: articleId },
    select: { id: true, authorId: true, slug: true },
  });

  if (!article) {
    throw new Error("Artikel tidak ditemukan");
  }

  const isOwner = article.authorId === session.user.id;
  const isAdmin =
    session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN";

  if (!isOwner && !isAdmin) {
    throw new Error("Tidak berhak mengubah galeri artikel ini");
  }

  return { user: session.user, article };
}

// ─── 1. Add Image to Gallery ─────────────────────────────────────────────────

export async function addArticleImageAction(
  _prevState: ActionResult<{ id: string; url: string }> | null,
  formData: FormData
): Promise<ActionResult<{ id: string; url: string }>> {
  const rawInput = {
    articleId: formData.get("articleId"),
    imageDataUri: formData.get("imageDataUri"),
    caption: formData.get("caption") ?? "",
  };

  const parsed = addGalleryImageSchema.safeParse(rawInput);
  if (!parsed.success) {
    const firstError = parsed.error.issues?.[0]?.message ?? "Input tidak valid";
    return { success: false, error: firstError };
  }

  const { articleId, imageDataUri, caption } = parsed.data;

  // Auth + ownership check
  let accessInfo;
  try {
    accessInfo = await requireArticleAccess(articleId);
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }

  // Rate limit
  try {
    const headersList = await headers();
    const ip = getClientIpFromNextHeaders(headersList);
    const rl = checkRateLimit(
      `gallery-upload:${accessInfo.user.id}:${ip}`,
      UPLOAD_GALLERY_RATE_LIMIT
    );
    if (!rl.success) {
      return {
        success: false,
        error: "Terlalu banyak upload gambar. Coba lagi nanti.",
      };
    }
  } catch {
    // Non-fatal
  }

  // Max 10 gambar per artikel
  const existingCount = await prisma.articleImage.count({
    where: { articleId },
  });
  if (existingCount >= 10) {
    return {
      success: false,
      error: "Maksimal 10 gambar per artikel. Hapus gambar lama untuk menambah yang baru.",
    };
  }

  // Validasi ukuran (max 5MB approximate dari base64)
  const base64Length = imageDataUri.length * 0.75;
  if (base64Length > 5 * 1024 * 1024) {
    return { success: false, error: "Ukuran gambar maksimal 5MB" };
  }

  // Upload ke Cloudinary
  let uploadResult;
  try {
    uploadResult = await uploadArticleImage(imageDataUri, articleId);
  } catch (err) {
    console.error("[GALLERY_UPLOAD_ERROR]", err);
    return {
      success: false,
      error: "Gagal mengupload gambar. Pastikan format JPEG/PNG/WebP.",
    };
  }

  // Sanitasi caption (plain text)
  const safeCaption = caption ? sanitizeText(caption).trim() || null : null;

  // Save ke DB
  try {
    const image = await prisma.articleImage.create({
      data: {
        articleId,
        url: uploadResult.url,
        publicId: uploadResult.publicId,
        caption: safeCaption,
        order: existingCount,
      },
      select: { id: true, url: true },
    });

    revalidatePath(`/berita/${accessInfo.article.slug}`);
    revalidatePath(`/dashboard/tulis/${articleId}`);

    return { success: true, data: image };
  } catch (err) {
    console.error("[GALLERY_SAVE_ERROR]", err);
    try {
      await deleteAdImage(uploadResult.publicId);
    } catch {
      // Non-fatal
    }
    return { success: false, error: "Gagal menyimpan gambar" };
  }
}

// ─── 2. Update Caption ───────────────────────────────────────────────────────

export async function updateArticleImageCaptionAction(
  imageId: string,
  caption: string
): Promise<ActionResult> {
  const parsed = updateCaptionSchema.safeParse({ imageId, caption });
  if (!parsed.success) {
    return { success: false, error: "Caption tidak valid" };
  }

  const image = await prisma.articleImage.findUnique({
    where: { id: imageId },
    select: { articleId: true },
  });
  if (!image) {
    return { success: false, error: "Gambar tidak ditemukan" };
  }

  try {
    await requireArticleAccess(image.articleId);
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }

  const safeCaption = caption ? sanitizeText(caption).trim() || null : null;

  try {
    await prisma.articleImage.update({
      where: { id: imageId },
      data: { caption: safeCaption },
    });
  } catch (err) {
    console.error("[CAPTION_UPDATE_ERROR]", err);
    return { success: false, error: "Gagal update caption" };
  }

  return { success: true, data: undefined };
}

// ─── 3. Delete Image ─────────────────────────────────────────────────────────

export async function deleteArticleImageAction(
  imageId: string
): Promise<ActionResult> {
  const image = await prisma.articleImage.findUnique({
    where: { id: imageId },
    select: {
      id: true,
      articleId: true,
      publicId: true,
      article: { select: { slug: true } },
    },
  });
  if (!image) {
    return { success: false, error: "Gambar tidak ditemukan" };
  }

  try {
    await requireArticleAccess(image.articleId);
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }

  if (image.publicId) {
    try {
      await deleteAdImage(image.publicId);
    } catch {
      console.warn("Gagal hapus gambar dari Cloudinary:", image.publicId);
    }
  }

  try {
    await prisma.articleImage.delete({ where: { id: imageId } });
  } catch (err) {
    console.error("[GALLERY_DELETE_ERROR]", err);
    return { success: false, error: "Gagal menghapus gambar" };
  }

  revalidatePath(`/berita/${image.article.slug}`);
  return { success: true, data: undefined };
}

// ─── 4. Reorder Images ───────────────────────────────────────────────────────

export async function reorderArticleImagesAction(
  articleId: string,
  imageIds: string[]
): Promise<ActionResult> {
  try {
    await requireArticleAccess(articleId);
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }

  try {
    await prisma.$transaction(
      imageIds.map((id, index) =>
        prisma.articleImage.update({
          where: { id },
          data: { order: index },
        })
      )
    );
  } catch (err) {
    console.error("[REORDER_ERROR]", err);
    return { success: false, error: "Gagal mengubah urutan" };
  }

  return { success: true, data: undefined };
}

// ─── 5. Get Gallery Images ───────────────────────────────────────────────────

export async function getArticleGalleryImages(articleId: string) {
  return prisma.articleImage.findMany({
    where: { articleId },
    orderBy: { order: "asc" },
    select: {
      id: true,
      url: true,
      caption: true,
      order: true,
    },
  });
}