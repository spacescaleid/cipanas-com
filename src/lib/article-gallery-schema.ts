// src/lib/article-gallery-schema.ts
import { z } from "zod";

/**
 * Schema untuk menambah gambar ke galeri artikel.
 */
export const addGalleryImageSchema = z.object({
  articleId: z.string().min(1, "Article ID required"),
  imageDataUri: z
    .string()
    .min(1, "Pilih file gambar")
    .refine(
      (val) => val.startsWith("data:image/"),
      "File harus berupa gambar (JPEG/PNG/WebP)"
    ),
  caption: z
    .string()
    // Caption fleksibel panjang-pendeknya — boleh kosong, boleh pendek,
    // boleh panjang. Batas 500 karakter ini bukan target "caption harus
    // pendek", hanya pagar kewajaran supaya tidak disalahgunakan untuk
    // spam teks panjang berlebihan.
    .max(500, "Caption maksimal 500 karakter")
    .optional()
    .or(z.literal("")),
});

export type AddGalleryImageInput = z.infer<typeof addGalleryImageSchema>;

/**
 * Schema untuk update caption gambar.
 */
export const updateCaptionSchema = z.object({
  imageId: z.string().min(1),
  caption: z
    .string()
    .max(500, "Caption maksimal 500 karakter")
    .optional()
    .or(z.literal("")),
});

export type UpdateCaptionInput = z.infer<typeof updateCaptionSchema>;