// src/lib/ad-schema.ts
import { z } from "zod";

export const adOrderSchema = z
  .object({
    advertiserName: z
      .string()
      .min(2, "Nama minimal 2 karakter")
      .max(100, "Nama maksimal 100 karakter"),
    email: z.string().email("Email tidak valid"),
    slotId: z.string().min(1, "Pilih slot iklan"),
    mediaUrl: z.string().url("Upload materi iklan dulu"),
    targetUrl: z.string().url("URL tujuan tidak valid"),
    startDate: z.string().datetime({ message: "Tanggal mulai tidak valid" }),
    endDate: z.string().datetime({ message: "Tanggal berakhir tidak valid" }),
  })
  .refine(
    (data) => new Date(data.endDate) > new Date(data.startDate),
    { message: "Tanggal berakhir harus setelah tanggal mulai", path: ["endDate"] }
  )
  .refine(
    (data) => {
      const start = new Date(data.startDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return start >= today;
    },
    { message: "Tanggal mulai tidak boleh di masa lalu", path: ["startDate"] }
  );

export type AdOrderInput = z.infer<typeof adOrderSchema>;