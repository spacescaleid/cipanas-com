// src/lib/comment-schema.ts
import { z } from "zod";

/**
 * Schema untuk create comment.
 * Comment bisa untuk artikel ATAU video (salah satu, tidak keduanya).
 */
export const createCommentSchema = z
  .object({
    content: z
      .string()
      .min(3, "Komentar minimal 3 karakter")
      .max(1000, "Komentar maksimal 1000 karakter"),
    articleId: z.string().optional(),
    videoId: z.string().optional(),
  })
  .refine(
    (data) =>
      (data.articleId && !data.videoId) || (!data.articleId && data.videoId),
    {
      message: "Comment harus untuk artikel atau video (salah satu)",
      path: ["articleId"],
    }
  );

export type CreateCommentInput = z.infer<typeof createCommentSchema>;

/**
 * Schema untuk moderasi komentar oleh admin.
 */
export const moderateCommentSchema = z.object({
  commentId: z.string().min(1),
  action: z.enum(["APPROVE", "SPAM", "DELETE"]),
});

export type ModerateCommentInput = z.infer<typeof moderateCommentSchema>;