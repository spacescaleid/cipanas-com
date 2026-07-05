// src/types/video.ts
import type { Video, VideoStatus, VideoPlatform, User } from "@prisma/client";

export type { VideoStatus, VideoPlatform };

export type VideoWithAuthor = Video & {
  author: Pick<User, "id" | "name" | "image">;
};

export type VideoListItem = Pick<
  Video,
  | "id"
  | "title"
  | "slug"
  | "platform"
  | "externalId"
  | "sourceUrl"
  | "thumbnail"
  | "duration"
  | "viewCount"
  | "status"
  | "publishedAt"
  | "createdAt"
> & {
  author: {
    id: string;
    name: string;
  };
  _count?: {
    comments: number;
  };
};

export const VIDEO_STATUS_LABELS: Record<VideoStatus, string> = {
  PENDING: "Menunggu Review",
  PUBLISHED: "Tayang",
  REJECTED: "Ditolak",
};

export const VIDEO_STATUS_COLORS: Record<
  VideoStatus,
  { bg: string; text: string; border: string }
> = {
  PENDING: {
    bg: "bg-yellow-50",
    text: "text-yellow-800",
    border: "border-yellow-200",
  },
  PUBLISHED: {
    bg: "bg-green-50",
    text: "text-green-800",
    border: "border-green-200",
  },
  REJECTED: {
    bg: "bg-red-50",
    text: "text-red-800",
    border: "border-red-200",
  },
};