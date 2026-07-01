// src/lib/profile-schema.ts
import { z } from "zod";

export const profileSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter").max(80),
  bio: z.string().max(500, "Bio maksimal 500 karakter").optional().or(z.literal("")),
  image: z.string().url("URL foto tidak valid").optional().or(z.literal("")),
});

export type ProfileFormData = z.infer<typeof profileSchema>;