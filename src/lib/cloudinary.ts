// src/lib/cloudinary.ts
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export { cloudinary };

/**
 * Generate signed upload params untuk upload dari client.
 */
export function generateSignedUploadParams(folder = "cipanas") {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      "Cloudinary belum di-setup di .env (cloud_name/api_key/api_secret)"
    );
  }

  const timestamp = Math.round(Date.now() / 1000);

  // Parameter yang akan di-sign — HARUS sama dengan yang dikirim saat upload
  const paramsToSign = {
    folder,
    timestamp,
  };

  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    apiSecret
  );

  console.log("[CLOUDINARY_SIGN]", {
    cloudName,
    apiKey: apiKey.substring(0, 6) + "...",
    folder,
    timestamp,
    signaturePrefix: signature.substring(0, 10) + "...",
  });

  return {
    signature,
    timestamp,
    folder,
    apiKey,
    cloudName,
  };
}