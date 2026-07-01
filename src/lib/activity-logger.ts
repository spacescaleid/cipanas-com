// src/lib/activity-logger.ts
import { prisma } from "./prisma";

/**
 * Catat aktivitas admin ke tabel ActivityLog.
 * Aman untuk dipanggil, error tidak akan throw (fire-and-forget style).
 */
export async function logActivity(
  userId: string,
  action: string,
  target: string
) {
  try {
    await prisma.activityLog.create({
      data: { userId, action, target },
    });
  } catch (error) {
    console.error("[ACTIVITY_LOG_ERROR]", error);
  }
}

/** Kumpulan action constants biar konsisten */
export const ActivityAction = {
  APPROVE_ARTICLE: "APPROVE_ARTICLE",
  REJECT_ARTICLE: "REJECT_ARTICLE",
  REQUEST_REVISION: "REQUEST_REVISION",
  UNPUBLISH_ARTICLE: "UNPUBLISH_ARTICLE",
  DELETE_ARTICLE: "DELETE_ARTICLE",
  CREATE_CATEGORY: "CREATE_CATEGORY",
  UPDATE_CATEGORY: "UPDATE_CATEGORY",
  DELETE_CATEGORY: "DELETE_CATEGORY",
  CHANGE_USER_ROLE: "CHANGE_USER_ROLE",
  DELETE_USER: "DELETE_USER",
  APPROVE_AD: "APPROVE_AD",
  REJECT_AD: "REJECT_AD",
} as const;

export type ActivityActionType =
  (typeof ActivityAction)[keyof typeof ActivityAction];