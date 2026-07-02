// src/app/api/ads/route.ts
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { adOrderSchema } from "@/lib/ad-schema";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("[AD_ORDER_REQUEST]", body);

    const parsed = adOrderSchema.safeParse(body);
    if (!parsed.success) {
      console.error(
        "[AD_ORDER_VALIDATION_ERROR]",
        parsed.error.flatten()
      );
      return NextResponse.json(
        {
          error: "Data tidak valid",
          issues: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const {
      advertiserName,
      email,
      slotId,
      mediaUrl,
      targetUrl,
      startDate,
      endDate,
    } = parsed.data;

    // Cek slot exists
    const slot = await prisma.adSlot.findUnique({ where: { id: slotId } });
    if (!slot) {
      return NextResponse.json(
        { error: "Slot iklan tidak ditemukan" },
        { status: 400 }
      );
    }

    // Hitung durasi (hari) dan total price
    const start = new Date(startDate);
    const end = new Date(endDate);
    const durationMs = end.getTime() - start.getTime();
    const durationDays = Math.ceil(durationMs / (24 * 60 * 60 * 1000));

    if (durationDays < 1) {
      return NextResponse.json(
        { error: "Minimal durasi 1 hari" },
        { status: 400 }
      );
    }

    // Convert Prisma Decimal ke number lewat toString
    const pricePerDay = Number(slot.pricePerDay.toString());
    const totalPrice = pricePerDay * durationDays;

    console.log("[AD_ORDER_CREATE]", {
      slotId,
      durationDays,
      pricePerDay,
      totalPrice,
    });

    const order = await prisma.adOrder.create({
      data: {
        advertiserName,
        email,
        slotId,
        mediaUrl,
        targetUrl,
        startDate: start,
        endDate: end,
        totalPrice,
        status: "PENDING_PAYMENT",
      },
      select: { id: true, totalPrice: true, status: true },
    });

    return NextResponse.json(
      {
        message: "Order dibuat, silakan lanjut ke pembayaran",
        order: {
          id: order.id,
          totalPrice: Number(order.totalPrice.toString()),
          status: order.status,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[AD_ORDER_CREATE_ERROR]", error);
    return NextResponse.json(
      {
        error: "Server error",
        detail: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}