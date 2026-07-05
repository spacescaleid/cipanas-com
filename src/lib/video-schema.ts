// src/lib/video-schema.ts
import { z } from "zod";
import { detectPlatform } from "./video-platforms";

/**
 * Schema untuk create video.
 * URL bisa YouTube, TikTok, atau Instagram — platform auto-detected.
 */
export const createVideoSchema = z.object({
  title: z
    .string()
    .min(5, "Judul minimal 5 karakter")
    .max(200, "Judul maksimal 200 karakter"),
  description: z
    .string()
    .max(1000, "Deskripsi maksimal 1000 karakter")
    .optional()
    .or(z.literal("")),
  videoUrl: z
    .string()
    .url("URL tidak valid")
    .refine(
      (url) => detectPlatform(url) !== null,
      "URL harus dari YouTube, TikTok, atau Instagram yang valid"
    ),
});

export type CreateVideoInput = z.infer<typeof createVideoSchema>;

export const rejectVideoSchema = z.object({
  videoId: z.string().min(1),
  reason: z
    .string()
    .min(10, "Alasan penolakan minimal 10 karakter")
    .max(500, "Alasan terlalu panjang"),
});

export type RejectVideoInput = z.infer<typeof rejectVideoSchema>;