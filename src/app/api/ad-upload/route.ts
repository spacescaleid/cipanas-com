// src/app/api/ad-upload/route.ts
import { NextResponse } from "next/server";

import { generateSignedUploadParams } from "@/lib/cloudinary";

/**
 * Signed upload untuk materi iklan.
 * Ini endpoint PUBLIC (advertiser tidak wajib login).
 */
export async function POST() {
  try {
    const params = generateSignedUploadParams("cipanas/ads");
    return NextResponse.json(params);
  } catch (error) {
    console.error("[AD_UPLOAD_SIGN_ERROR]", error);
    return NextResponse.json(
      { error: "Gagal generate signature" },
      { status: 500 }
    );
  }
}