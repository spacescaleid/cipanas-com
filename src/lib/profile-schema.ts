// src/lib/profile-schema.ts
import { z } from "zod";

/**
 * Whitelist domain untuk foto profil.
 * Hanya URL dari Cloudinary yang diizinkan karena:
 * - Upload flow di aplikasi selalu menghasilkan URL dari res.cloudinary.com
 * - Cegah user set arbitrary URL yang bisa dipakai untuk tracking pixel,
 *   phishing, atau load resource dari domain yang tidak di-whitelist
 *   di next.config.js remotePatterns
 */
const CLOUDINARY_URL_PREFIX = "https://res.cloudinary.com/";

export const profileSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter").max(80),
  bio: z
    .string()
    .max(500, "Bio maksimal 500 karakter")
    .optional()
    .or(z.literal("")),
  image: z
    .string()
    .url("URL foto tidak valid")
    .refine(
      (url) => url === "" || url.startsWith(CLOUDINARY_URL_PREFIX),
      "Foto harus di-upload melalui form (hanya sumber yang dipercaya diizinkan)"
    )
    .optional()
    .or(z.literal("")),
});

export type ProfileFormData = z.infer<typeof profileSchema>;