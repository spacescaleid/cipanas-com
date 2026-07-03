// src/actions/admin-ad-actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { generateUploadToken, getUploadTokenExpiry } from "@/lib/ad-utils";
import { rejectCreativeSchema } from "@/lib/ad-schemas";
import {
  extractPublicIdFromUrl,
  deleteAdImage,
} from "@/lib/cloudinary-upload";
import type { ActionResult } from "./ad-order-actions";
import type { AdOrderStatus } from "@prisma/client";

// ─── Helper: Ambil pesan error pertama dari ZodError ─────────────────────────

function getFirstZodError(error: unknown): string {
  if (
    error &&
    typeof error === "object" &&
    "issues" in error &&
    Array.isArray((error as { issues: unknown[] }).issues)
  ) {
    const issues = (error as { issues: Array<{ message?: string }> }).issues;
    return issues[0]?.message ?? "Input tidak valid";
  }
  if (
    error &&
    typeof error === "object" &&
    "errors" in error &&
    Array.isArray((error as { errors: unknown[] }).errors)
  ) {
    const errors = (error as { errors: Array<{ message?: string }> }).errors;
    return errors[0]?.message ?? "Input tidak valid";
  }
  return "Input tidak valid";
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

// ─── 1. Verifikasi Pembayaran ─────────────────────────────────────────────────

export async function verifyPaymentAction(
  orderId: string
): Promise<
  ActionResult<{
    uploadToken: string;
    uploadLink: string;
    uploadTokenExpiresAt: Date;
  }>
> {
  let adminUser;
  try {
    adminUser = await requireAdmin();
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }

  const order = await prisma.adOrder.findUnique({ where: { id: orderId } });

  if (!order) {
    return { success: false, error: "Order tidak ditemukan" };
  }

  if (order.status !== "PENDING_PAYMENT") {
    return {
      success: false,
      error: `Order sudah dalam status ${order.status}, tidak bisa diverifikasi ulang`,
    };
  }

  const uploadToken = generateUploadToken();
  const uploadTokenExpiresAt = getUploadTokenExpiry(7);

  await prisma.adOrder.update({
    where: { id: orderId },
    data: {
      status: "AWAITING_CREATIVE",
      paymentConfirmedAt: new Date(),
      paymentConfirmedById: adminUser.id,
      uploadToken,
      uploadTokenExpiresAt,
    },
  });

  await prisma.activityLog.create({
    data: {
      userId: adminUser.id,
      action: "VERIFY_AD_PAYMENT",
      target: `AdOrder:${order.id} (${order.orderCode ?? order.id})`,
    },
  });

  revalidatePath("/admin/iklan");
  revalidatePath(`/admin/iklan/${orderId}`);
  if (order.orderCode) {
    revalidatePath(`/cek-status/${order.orderCode}`);
  }

  const baseUrl = process.env.NEXTAUTH_URL ?? "https://cipanas.com";
  const uploadLink = `${baseUrl}/upload-iklan/${uploadToken}`;

  return {
    success: true,
    data: { uploadToken, uploadLink, uploadTokenExpiresAt },
  };
}

// ─── 2. Setujui Materi Iklan ──────────────────────────────────────────────────

export async function approveCreativeAction(
  orderId: string
): Promise<ActionResult> {
  let adminUser;
  try {
    adminUser = await requireAdmin();
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }

  const order = await prisma.adOrder.findUnique({ where: { id: orderId } });

  if (!order) {
    return { success: false, error: "Order tidak ditemukan" };
  }

  if (order.status !== "PENDING_REVIEW") {
    return {
      success: false,
      error: "Order tidak dalam status menunggu review",
    };
  }

  if (!order.imageUrl || !order.targetUrl) {
    return {
      success: false,
      error: "Materi iklan belum lengkap (gambar atau URL kosong)",
    };
  }

  await prisma.adOrder.update({
    where: { id: orderId },
    data: {
      status: "ACTIVE",
      reviewedAt: new Date(),
      reviewedById: adminUser.id,
      rejectionReason: null,
      impressionCount: 0,
    },
  });

  await prisma.activityLog.create({
    data: {
      userId: adminUser.id,
      action: "APPROVE_AD_CREATIVE",
      target: `AdOrder:${order.id} (${order.orderCode ?? order.id})`,
    },
  });

  revalidatePath("/admin/iklan");
  revalidatePath(`/admin/iklan/${orderId}`);
  if (order.orderCode) {
    revalidatePath(`/cek-status/${order.orderCode}`);
  }

  return { success: true, data: undefined };
}

// ─── 3. Tolak Materi Iklan ───────────────────────────────────────────────────

export async function rejectCreativeAction(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  let adminUser;
  try {
    adminUser = await requireAdmin();
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }

  const parsed = rejectCreativeSchema.safeParse({
    orderId: formData.get("orderId"),
    rejectionReason: formData.get("rejectionReason"),
  });

  if (!parsed.success) {
    return { success: false, error: getFirstZodError(parsed.error) };
  }

  const { orderId, rejectionReason } = parsed.data;

  const order = await prisma.adOrder.findUnique({ where: { id: orderId } });
  if (!order) return { success: false, error: "Order tidak ditemukan" };
  if (order.status !== "PENDING_REVIEW") {
    return { success: false, error: "Order tidak dalam status review" };
  }

  // Cek apakah token masih valid (> 3 hari sebelum expiry)
  const tokenStillValid =
    order.uploadTokenExpiresAt &&
    order.uploadTokenExpiresAt >
      new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

  // Build update data — pakai object literal biasa dengan spread conditional
  const baseUpdate = {
    status: "AWAITING_CREATIVE" as AdOrderStatus,
    rejectionReason,
    reviewedAt: new Date(),
    reviewedById: adminUser.id,
    imageUrl: null,
  };

  const updateData = tokenStillValid
    ? baseUpdate
    : {
        ...baseUpdate,
        uploadToken: generateUploadToken(),
        uploadTokenExpiresAt: getUploadTokenExpiry(7),
      };

  await prisma.adOrder.update({
    where: { id: orderId },
    data: updateData,
  });

  await prisma.activityLog.create({
    data: {
      userId: adminUser.id,
      action: "REJECT_AD_CREATIVE",
      target: `AdOrder:${order.id} (${order.orderCode ?? order.id}) - ${rejectionReason}`,
    },
  });

  revalidatePath("/admin/iklan");
  revalidatePath(`/admin/iklan/${orderId}`);
  if (order.orderCode) {
    revalidatePath(`/cek-status/${order.orderCode}`);
  }

  return { success: true, data: undefined };
}

// ─── 4. Tandai Kedaluwarsa Manual ────────────────────────────────────────────

export async function expireOrderAction(
  orderId: string
): Promise<ActionResult> {
  let adminUser;
  try {
    adminUser = await requireAdmin();
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }

  const order = await prisma.adOrder.findUnique({ where: { id: orderId } });
  if (!order) return { success: false, error: "Order tidak ditemukan" };

  const expirableStatuses: AdOrderStatus[] = [
    "PENDING_PAYMENT",
    "AWAITING_CREATIVE",
    "ACTIVE",
  ];

  if (!expirableStatuses.includes(order.status)) {
    return {
      success: false,
      error: "Status ini tidak dapat di-expire secara manual",
    };
  }

  await prisma.adOrder.update({
    where: { id: orderId },
    data: { status: "EXPIRED" },
  });

  await prisma.activityLog.create({
    data: {
      userId: adminUser.id,
      action: "EXPIRE_AD_ORDER",
      target: `AdOrder:${order.id} (${order.orderCode ?? order.id})`,
    },
  });

  revalidatePath("/admin/iklan");
  revalidatePath(`/admin/iklan/${orderId}`);

  return { success: true, data: undefined };
}

// ─── 5. Hapus Iklan Permanent (untuk EXPIRED/REJECTED) ──────────────────────

export async function deleteAdOrderAction(
  orderId: string
): Promise<ActionResult> {
  let adminUser;
  try {
    adminUser = await requireAdmin();
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }

  const order = await prisma.adOrder.findUnique({ where: { id: orderId } });
  if (!order) return { success: false, error: "Order tidak ditemukan" };

  // Hanya boleh hapus iklan yang sudah EXPIRED atau REJECTED
  // Iklan yang masih aktif/pending TIDAK BOLEH dihapus (harus expire dulu)
  const deletableStatuses: AdOrderStatus[] = ["EXPIRED", "REJECTED"];

  if (!deletableStatuses.includes(order.status)) {
    return {
      success: false,
      error: `Hanya iklan berstatus EXPIRED atau REJECTED yang bisa dihapus. Status saat ini: ${order.status}. Kalau iklan masih aktif, gunakan tombol "Hentikan Sekarang" dulu.`,
    };
  }

  // Hapus gambar dari Cloudinary kalau ada (best-effort)
  if (order.imageUrl) {
    const publicId = extractPublicIdFromUrl(order.imageUrl);
    if (publicId) {
      try {
        await deleteAdImage(publicId);
      } catch {
        console.warn(
          "Gagal hapus gambar dari Cloudinary saat delete order:",
          publicId
        );
        // Non-fatal: lanjut hapus order di DB
      }
    }
  }

  // Simpan info untuk log sebelum record dihapus
  const orderInfoForLog = `${order.id} (${order.orderCode ?? order.id}) - ${order.status}`;

  // Hapus order dari DB (cascade akan hapus Payment records terkait)
  try {
    await prisma.adOrder.delete({ where: { id: orderId } });
  } catch (err) {
    console.error("Delete adOrder error:", err);
    return {
      success: false,
      error: "Gagal menghapus order dari database",
    };
  }

  await prisma.activityLog.create({
    data: {
      userId: adminUser.id,
      action: "DELETE_AD_ORDER",
      target: `AdOrder:${orderInfoForLog}`,
    },
  });

  revalidatePath("/admin/iklan");

  return { success: true, data: undefined };
}

// ─── 6. Ambil Semua Order ─────────────────────────────────────────────────────

export async function getAllAdOrders(statusFilter?: string) {
  const validStatuses: AdOrderStatus[] = [
    "PENDING_PAYMENT",
    "AWAITING_CREATIVE",
    "PENDING_REVIEW",
    "ACTIVE",
    "REJECTED",
    "EXPIRED",
  ];

  const isValidFilter =
    statusFilter && validStatuses.includes(statusFilter as AdOrderStatus);

  const orders = await prisma.adOrder.findMany({
    where: isValidFilter
      ? { status: statusFilter as AdOrderStatus }
      : undefined,
    include: {
      slot: true,
      paymentConfirmedBy: { select: { id: true, name: true } },
      reviewedBy: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return orders;
}

// ─── 7. Ambil Detail Satu Order ───────────────────────────────────────────────

export async function getAdOrderDetail(id: string) {
  return prisma.adOrder.findUnique({
    where: { id },
    include: {
      slot: true,
      paymentConfirmedBy: { select: { id: true, name: true, email: true } },
      reviewedBy: { select: { id: true, name: true, email: true } },
    },
  });
}