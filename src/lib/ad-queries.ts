// src/lib/ad-queries.ts

import prisma from "@/lib/prisma";
import type { AdPosition } from "@prisma/client";
import { serializePrisma } from "@/lib/serialize";

/**
 * Ambil semua slot iklan aktif.
 */
export async function getActiveSlots() {
  const slotsRaw = await prisma.adSlot.findMany({
    where: { isActive: true },
    orderBy: { pricePerDay: "asc" },
  });

  return serializePrisma(slotsRaw);
}

/**
 * Ambil detail order iklan berdasarkan orderCode.
 */
export async function getOrderByCode(orderCode: string) {
  const orderRaw = await prisma.adOrder.findUnique({
    where: { orderCode },
    include: {
      slot: true,
      paymentConfirmedBy: {
        select: { id: true, name: true },
      },
    },
  });

  if (!orderRaw) return null;
  return serializePrisma(orderRaw);
}

/**
 * Ambil iklan aktif untuk posisi tertentu, untuk sistem rotasi.
 */
export async function getActiveAdsForPosition(position: string, limit = 5) {
  const now = new Date();

  const ordersRaw = await prisma.adOrder.findMany({
    where: {
      status: "ACTIVE",
      startDate: { lte: now },
      endDate: { gte: now },
      slot: {
        position: position as AdPosition,
      },
      OR: [
        { imageUrl: { not: null } },
        { mediaUrl: { not: null } },
      ],
    },
    select: {
      id: true,
      orderCode: true,
      imageUrl: true,
      mediaUrl: true,
      targetUrl: true,
      altText: true,
      impressionCount: true,
      clickCount: true,
      slot: {
        select: {
          id: true,
          position: true,
          size: true,
          label: true,
        },
      },
    },
    orderBy: {
      impressionCount: "asc",
    },
    take: limit,
  });

  const orders = serializePrisma(ordersRaw);

  return orders.map((order) => ({
    ...order,
    displayImageUrl: order.imageUrl ?? order.mediaUrl ?? "",
  }));
}

/**
 * Ambil semua iklan aktif untuk semua posisi (grouped).
 * Berguna untuk pre-fetch di layout.
 */
export async function getAllActiveAds() {
  const now = new Date();

  const ordersRaw = await prisma.adOrder.findMany({
    where: {
      status: "ACTIVE",
      startDate: { lte: now },
      endDate: { gte: now },
      OR: [
        { imageUrl: { not: null } },
        { mediaUrl: { not: null } },
      ],
    },
    select: {
      id: true,
      orderCode: true,
      imageUrl: true,
      mediaUrl: true,
      targetUrl: true,
      altText: true,
      impressionCount: true,
      clickCount: true,
      slot: {
        select: {
          id: true,
          position: true,
          size: true,
          label: true,
        },
      },
    },
    orderBy: {
      impressionCount: "asc",
    },
  });

  return serializePrisma(ordersRaw);
}

/**
 * Increment impression count.
 */
export async function incrementAdImpression(adOrderId: string) {
  await prisma.adOrder.update({
    where: { id: adOrderId },
    data: {
      impressionCount: { increment: 1 },
    },
  });
}

/**
 * Increment click count.
 */
export async function incrementAdClick(adOrderId: string) {
  await prisma.adOrder.update({
    where: { id: adOrderId },
    data: {
      clickCount: { increment: 1 },
    },
  });
}