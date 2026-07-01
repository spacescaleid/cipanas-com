// src/lib/article-schema.ts
import { z } from "zod";

export const articleFormSchema = z.object({
  title: z
    .string()
    .min(10, "Judul minimal 10 karakter")
    .max(200, "Judul maksimal 200 karakter"),
  content: z
    .string()
    .min(50, "Konten minimal 50 karakter"),
  coverImage: z
    .string()
    .url("URL cover tidak valid")
    .optional()
    .or(z.literal("")),
  categoryId: z.string().min(1, "Pilih kategori"),
});

export const createArticleSchema = articleFormSchema.extend({
  action: z.enum(["DRAFT", "PENDING"]),
});

export const updateArticleSchema = articleFormSchema.extend({
  action: z.enum(["DRAFT", "PENDING"]),
});

export type ArticleFormData = z.infer<typeof articleFormSchema>;
export type CreateArticleInput = z.infer<typeof createArticleSchema>;
export type UpdateArticleInput = z.infer<typeof updateArticleSchema>;