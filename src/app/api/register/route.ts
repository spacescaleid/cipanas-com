// src/app/api/register/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import {
  checkRateLimit,
  getClientIp,
  REGISTER_RATE_LIMIT,
} from "@/lib/rate-limit";
import { sanitizeText } from "@/lib/sanitize";

const registerSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter").max(80),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

export async function POST(request: Request) {
  try {
    // ─── Rate limiting ──────────────────────────────────────
    const ip = getClientIp(request);
    const rl = checkRateLimit(`register:${ip}`, REGISTER_RATE_LIMIT);
    if (!rl.success) {
      return NextResponse.json(
        {
          error:
            "Terlalu banyak percobaan pendaftaran. Coba lagi dalam 1 jam.",
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(
              Math.ceil((rl.resetAt - Date.now()) / 1000)
            ),
          },
        }
      );
    }

    // ─── Parse & validasi input ─────────────────────────────
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Data tidak valid",
          issues: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;
    // Sanitasi name (strip HTML tag kalau ada)
    const name = sanitizeText(parsed.data.name).trim();

    if (name.length < 2) {
      return NextResponse.json(
        { error: "Nama tidak valid" },
        { status: 400 }
      );
    }

    // Normalize email
    const normalizedEmail = email.trim().toLowerCase();

    // ─── Cek email sudah dipakai ───────────────────────────
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Email sudah terdaftar" },
        { status: 409 }
      );
    }

    // ─── Hash password & simpan user ────────────────────────
    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        passwordHash,
        // ⚠️ Default role VISITOR untuk cegah rantai XSS:
        // - Sebelumnya CONTRIBUTOR = bisa langsung tulis artikel
        // - Sekarang VISITOR = hanya bisa baca, admin promote manual
        role: "VISITOR",
      },
      select: { id: true, name: true, email: true, role: true },
    });

    return NextResponse.json(
      {
        message:
          "Registrasi berhasil. Hubungi admin untuk mendapat akses kontributor.",
        user,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[REGISTER_ERROR]", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan di server" },
      { status: 500 }
    );
  }
}