// src/lib/ad-queries.ts
import type { AdOrderStatus } from "@prisma/client";
import { prisma } from "./prisma";

/** Semua slot iklan yang tersedia */
export async function getAdSlots() {
  return prisma.adSlot.findMany({
    orderBy: { pricePerDay: "desc" },
  });
}

/** Detail 1 slot */
export async function getAdSlotById(id: string) {
  return prisma.adSlot.findUnique({ where: { id } });
}

/** Detail ad order */
export async function getAdOrderById(id: string) {
  return prisma.adOrder.findUnique({
    where: { id },
    include: {
      slot: true,
      payments: { orderBy: { createdAt: "desc" } },
    },
  });
}

/** List ad order untuk admin */
export async function getAdminAdOrders(status?: AdOrderStatus) {
  return prisma.adOrder.findMany({
    where: status ? { status } : {},
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    include: {
      slot: true,
      payments: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });
}

/** Count ad order per status */
export async function getAdOrderCounts() {
  const counts = await prisma.adOrder.groupBy({
    by: ["status"],
    _count: { status: true },
  });
  const map: Record<string, number> = {
    ALL: 0,
    PENDING_PAYMENT: 0,
    PENDING_APPROVAL: 0,
    ACTIVE: 0,
    EXPIRED: 0,
    REJECTED: 0,
  };
  counts.forEach((c) => {
    map[c.status] = c._count.status;
    map.ALL += c._count.status;
  });
  return map;
}

/**
 * Ambil iklan aktif untuk posisi tertentu.
 * Untuk sekarang ambil yg random dari list active.
 */
export async function getActiveAdForPosition(position: string) {
  const now = new Date();
  const orders = await prisma.adOrder.findMany({
    where: {
      status: "ACTIVE",
      startDate: { lte: now },
      endDate: { gte: now },
      slot: { position: position as never }, // cast karena enum
    },
    include: { slot: true },
  });

  if (orders.length === 0) return null;
  // Pilih random supaya rotasi iklan
  return orders[Math.floor(Math.random() * orders.length)];
}