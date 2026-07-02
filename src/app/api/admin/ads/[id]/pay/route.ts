// src/app/api/ads/[id]/pay/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { simulatePayment } from "@/lib/payment-mock";

const bodySchema = z.object({
  method: z.enum(["bank_transfer", "qris", "virtual_account", "credit_card"]),
});

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, { params }: RouteContext) {
  const { id } = await params;

  try {
    const body = await request.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Metode pembayaran tidak valid" },
        { status: 400 }
      );
    }

    const order = await prisma.adOrder.findUnique({ where: { id } });
    if (!order) {
      return NextResponse.json(
        { error: "Order tidak ditemukan" },
        { status: 404 }
      );
    }

    if (order.status !== "PENDING_PAYMENT") {
      return NextResponse.json(
        { error: "Order sudah dibayar atau tidak valid" },
        { status: 400 }
      );
    }

    console.log("[AD_PAY_START]", {
      orderId: order.id,
      method: parsed.data.method,
      amount: Number(order.totalPrice.toString()),
    });

    // Simulasi call ke payment gateway
    const paymentResult = await simulatePayment({
      orderId: order.id,
      amount: Number(order.totalPrice.toString()),
      method: parsed.data.method,
    });

    if (!paymentResult.success) {
      return NextResponse.json(
        { error: "Pembayaran gagal, coba lagi" },
        { status: 402 }
      );
    }

    // Transaksi: buat Payment + update AdOrder status
    await prisma.$transaction([
      prisma.payment.create({
        data: {
          adOrderId: order.id,
          amount: order.totalPrice,
          method: parsed.data.method,
          gatewayStatus: paymentResult.gatewayStatus,
          paymentRef: paymentResult.paymentRef,
        },
      }),
      prisma.adOrder.update({
        where: { id: order.id },
        data: { status: "AWAITING_CREATIVE" },
      }),
    ]);

    console.log("[AD_PAY_SUCCESS]", {
      orderId: order.id,
      paymentRef: paymentResult.paymentRef,
    });

    return NextResponse.json({
      message: "Pembayaran berhasil, iklan menunggu persetujuan admin",
      paymentRef: paymentResult.paymentRef,
    });
  } catch (error) {
    console.error("[AD_PAY_ERROR]", error);
    return NextResponse.json(
      {
        error: "Server error",
        detail: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}