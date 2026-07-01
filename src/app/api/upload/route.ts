// src/app/api/upload/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { generateSignedUploadParams } from "@/lib/cloudinary";

/**
 * Generate signed upload parameter untuk client-side upload ke Cloudinary.
 * Wajib login (contributor+).
 */
export async function POST() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = session.user.role;
  if (role === "VISITOR") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const params = generateSignedUploadParams("cipanas/articles");
    return NextResponse.json(params);
  } catch (error) {
    console.error("[UPLOAD_SIGN_ERROR]", error);
    return NextResponse.json(
      { error: "Gagal generate signature" },
      { status: 500 }
    );
  }
} 