// src/app/api/upload/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { generateSignedUploadParams } from "@/lib/cloudinary";
import {
  checkRateLimit,
  getClientIp,
  UPLOAD_GALLERY_RATE_LIMIT,
} from "@/lib/rate-limit";

/**
 * Generate signed upload parameter untuk client-side upload ke Cloudinary.
 * Wajib login (contributor+).
 */
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = session.user.role;
  if (role === "VISITOR") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Rate limit per user (fallback ke IP kalau user.id tidak ada)
  const userId = (session.user as { id?: string }).id;
  const rateKey = `upload:${userId ?? getClientIp(request)}`;
  const rl = checkRateLimit(rateKey, UPLOAD_GALLERY_RATE_LIMIT);
  if (!rl.success) {
    return NextResponse.json(
      { error: "Terlalu banyak upload. Coba lagi sebentar." },
      { status: 429 },
    );
  }

  try {
    const params = generateSignedUploadParams("cipanas/articles");
    return NextResponse.json(params);
  } catch (error) {
    console.error("[UPLOAD_SIGN_ERROR]", error);
    return NextResponse.json(
      { error: "Gagal generate signature" },
      { status: 500 },
    );
  }
}