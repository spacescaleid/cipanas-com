// src/actions/ad-order-actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import {
  generateOrderCode,
  normalizeWhatsAppNumber,
  calculateTotalPrice,
} from "@/lib/ad-utils";
import {
  uploadAdImage,
  extractPublicIdFromUrl,
  deleteAdImage,
} from "@/lib/cloudinary-upload";
import {
  createAdOrderServerSchema,
  uploadCreativeSchema,
  validateAdImageDimensions,
} from "@/lib/ad-schemas";
import type { ZodError } from "zod";

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

// ─── 1. Buat Order Baru ───────────────────────────────────────────────────────

export async function createAdOrderAction(
  _prevState: ActionResult<{ orderCode: string }> | null,
  formData: FormData
): Promise<ActionResult<{ orderCode: string }>> {
  const rawInput = {
    advertiserName: formData.get("advertiserName"),
    businessName: formData.get("businessName"),
    whatsappNumber: formData.get("whatsappNumber"),
    slotId: formData.get("slotId"),
    durationDays: formData.get("durationDays"),
    startDate: formData.get("startDate"),
  };

  const parsed = createAdOrderServerSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { success: false, error: getFirstZodError(parsed.error) };
  }

  const {
    advertiserName,
    businessName,
    whatsappNumber,
    slotId,
    durationDays,
    startDate,
  } = parsed.data;

  const slot = await prisma.adSlot.findUnique({
    where: { id: slotId },
  });

  if (!slot) {
    return { success: false, error: "Slot iklan tidak ditemukan" };
  }

  if (!slot.isActive) {
    return { success: false, error: "Slot iklan ini sedang tidak tersedia" };
  }

  const startDateObj = new Date(startDate);
  const endDateObj = new Date(startDate);
  endDateObj.setDate(endDateObj.getDate() + durationDays);

  const totalPrice = calculateTotalPrice(
    Number(slot.pricePerDay),
    durationDays
  );

  // Generate kode order unik dengan retry
  let orderCode = generateOrderCode();
  let attempts = 0;
  while (attempts < 5) {
    const existing = await prisma.adOrder.findUnique({
      where: { orderCode },
    });
    if (!existing) break;
    orderCode = generateOrderCode();
    attempts++;
  }

  if (attempts >= 5) {
    return { success: false, error: "Gagal generate kode order, coba lagi" };
  }

  const normalizedWa = normalizeWhatsAppNumber(whatsappNumber);

  try {
    await prisma.adOrder.create({
      data: {
        orderCode,
        advertiserName,
        businessName,
        whatsappNumber: normalizedWa,
        slotId,
        startDate: startDateObj,
        endDate: endDateObj,
        totalPrice,
        status: "PENDING_PAYMENT",
      },
    });
  } catch (err) {
    console.error("createAdOrderAction error:", err);
    return { success: false, error: "Gagal menyimpan pesanan, coba lagi" };
  }

  redirect(`/pasang-iklan/${orderCode}/instruksi`);
}

// ─── 2. Submit Materi Iklan (via token) ──────────────────────────────────────

export async function submitCreativeAction(
  token: string,
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const order = await prisma.adOrder.findUnique({
    where: { uploadToken: token },
    include: { slot: true },
  });

  if (!order) {
    return { success: false, error: "Link upload tidak valid" };
  }

  if (
    !order.uploadTokenExpiresAt ||
    order.uploadTokenExpiresAt < new Date()
  ) {
    return {
      success: false,
      error: "Link upload sudah kedaluwarsa. Hubungi admin untuk link baru.",
    };
  }

  if (order.status !== "AWAITING_CREATIVE" && order.status !== "REJECTED") {
    return {
      success: false,
      error: `Upload tidak dapat dilakukan pada status order saat ini (${order.status})`,
    };
  }

  const rawInput = {
    imageDataUri: formData.get("imageDataUri"),
    targetUrl: formData.get("targetUrl"),
    altText: formData.get("altText") ?? "",
    imageWidth: formData.get("imageWidth"),
    imageHeight: formData.get("imageHeight"),
    imageSizeBytes: formData.get("imageSizeBytes"),
  };

  const parsed = uploadCreativeSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { success: false, error: getFirstZodError(parsed.error) };
  }

  const {
    imageDataUri,
    targetUrl,
    altText,
    imageWidth,
    imageHeight,
    imageSizeBytes,
  } = parsed.data;

  // ═══════════════════════════════════════════════════════════════
  // VALIDASI CLIENT-SIDE (dari data yang dikirim client)
  // Ini validasi cepat untuk reject request obvious sebelum upload.
  // TIDAK BOLEH sepenuhnya percaya — akan divalidasi ulang setelah
  // upload dengan data asli dari Cloudinary di bawah.
  // ═══════════════════════════════════════════════════════════════
  const clientDimValidation = validateAdImageDimensions(
    imageWidth,
    imageHeight,
    order.slot.position,
    imageSizeBytes
  );

  if (!clientDimValidation.valid) {
    return { success: false, error: clientDimValidation.error! };
  }

  // Hapus gambar lama jika ada
  if (order.imageUrl) {
    const oldPublicId = extractPublicIdFromUrl(order.imageUrl);
    if (oldPublicId) {
      try {
        await deleteAdImage(oldPublicId);
      } catch {
        console.warn("Gagal hapus gambar lama:", oldPublicId);
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // Upload ke Cloudinary
  // ═══════════════════════════════════════════════════════════════
  let uploadResult;
  try {
    uploadResult = await uploadAdImage(
      imageDataUri,
      order.orderCode ?? order.id.slice(0, 8)
    );
  } catch (err) {
    console.error("Cloudinary upload error:", err);
    return {
      success: false,
      error:
        "Gagal mengupload gambar. Pastikan format JPEG/PNG/WebP dan coba lagi.",
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // 🔒 VALIDASI SERVER-SIDE (dari data Cloudinary asli)
  // Ini pertahanan sebenarnya — data dari Cloudinary tidak bisa
  // dimanipulasi client. Kalau tidak lulus, hapus gambar & tolak.
  // ═══════════════════════════════════════════════════════════════
  const serverDimValidation = validateAdImageDimensions(
    uploadResult.width,
    uploadResult.height,
    order.slot.position,
    uploadResult.bytes
  );

  if (!serverDimValidation.valid) {
    // Rollback: hapus gambar yang sudah terupload karena gagal validasi
    try {
      await deleteAdImage(uploadResult.publicId);
    } catch {
      console.warn(
        "Gagal rollback gambar setelah gagal validasi:",
        uploadResult.publicId
      );
    }
    return {
      success: false,
      error: `Ukuran gambar tidak sesuai: ${serverDimValidation.error}`,
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // Simpan ke database
  // ═══════════════════════════════════════════════════════════════
  try {
    await prisma.adOrder.update({
      where: { id: order.id },
      data: {
        imageUrl: uploadResult.url,
        targetUrl,
        altText: altText || null,
        status: "PENDING_REVIEW",
        creativeSubmittedAt: new Date(),
        rejectionReason: null,
      },
    });
  } catch (err) {
    console.error("DB update error setelah upload:", err);
    // Rollback: hapus gambar dari Cloudinary karena DB gagal
    try {
      await deleteAdImage(uploadResult.publicId);
    } catch {
      console.warn(
        "Gagal rollback gambar setelah DB error:",
        uploadResult.publicId
      );
    }
    return { success: false, error: "Gagal menyimpan data, hubungi admin" };
  }

  revalidatePath(`/upload-iklan/${token}`);
  if (order.orderCode) {
    revalidatePath(`/cek-status/${order.orderCode}`);
  }

  return { success: true, data: undefined };
}

// ─── 3. Cek Status Order (publik) ────────────────────────────────────────────

export async function getOrderByCode(orderCode: string) {
  const order = await prisma.adOrder.findUnique({
    where: { orderCode },
    include: {
      slot: true,
      paymentConfirmedBy: {
        select: { id: true, name: true },
      },
    },
  });
  return order;
}

// ─── 4. Cek Order via Token (untuk halaman upload) ───────────────────────────

export async function getOrderByToken(token: string) {
  const order = await prisma.adOrder.findUnique({
    where: { uploadToken: token },
    include: { slot: true },
  });
  return order;
}