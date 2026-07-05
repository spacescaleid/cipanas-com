// src/lib/cloudinary-upload.ts

import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface UploadAdImageResult {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

/**
 * Upload gambar iklan ke Cloudinary.
 * Folder: cipanas/ads/
 */
export async function uploadAdImage(
  base64DataUri: string,
  orderCode: string
): Promise<UploadAdImageResult> {
  const result = await cloudinary.uploader.upload(base64DataUri, {
    folder: "cipanas/ads",
    public_id: `ad-${orderCode}-${Date.now()}`,
    overwrite: false,
    resource_type: "image",
    transformation: [{ quality: "auto", fetch_format: "auto" }],
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
    width: result.width,
    height: result.height,
    format: result.format,
    bytes: result.bytes,
  };
}

/**
 * Hapus gambar dari Cloudinary.
 */
export async function deleteAdImage(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}

/**
 * Extract public_id dari Cloudinary URL.
 */
export function extractPublicIdFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split("/");
    const uploadIdx = pathParts.indexOf("upload");
    if (uploadIdx === -1) return null;
    const afterUpload = pathParts.slice(uploadIdx + 1);
    const startIdx = /^v\d+$/.test(afterUpload[0]) ? 1 : 0;
    const publicIdWithExt = afterUpload.slice(startIdx).join("/");
    return publicIdWithExt.replace(/\.[^.]+$/, "");
  } catch {
    return null;
  }
}

// ─── Article Gallery Image Upload ─────────────────────────────────────────────

export interface UploadArticleImageResult {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

/**
 * Upload gambar galeri artikel ke Cloudinary.
 * Folder: cipanas/articles/
 * Max size: dicek di server action sebelum panggil fungsi ini.
 */
export async function uploadArticleImage(
  base64DataUri: string,
  articleId: string
): Promise<UploadArticleImageResult> {
  const result = await cloudinary.uploader.upload(base64DataUri, {
    folder: "cipanas/articles",
    public_id: `article-${articleId}-${Date.now()}`,
    overwrite: false,
    resource_type: "image",
    transformation: [{ quality: "auto", fetch_format: "auto" }],
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
    width: result.width,
    height: result.height,
    format: result.format,
    bytes: result.bytes,
  };
}