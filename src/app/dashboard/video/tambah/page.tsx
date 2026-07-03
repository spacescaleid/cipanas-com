// src/app/dashboard/video/tambah/page.tsx
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { requireRole } from "@/lib/auth-utils";
import { VideoUploadForm } from "./VideoUploadForm";

export default async function TambahVideoPage() {
  await requireRole(["CONTRIBUTOR", "ADMIN", "SUPER_ADMIN"]);

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <Link
          href="/dashboard/video"
          className="inline-flex items-center gap-1 text-sm text-brand-600 hover:text-brand-700 dark:text-brand-400"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Video Saya
        </Link>
        <h1 className="mt-3 font-serif text-3xl font-bold text-neutral-900 dark:text-white">
          Tambah Video Baru
        </h1>
        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
          Bagikan video YouTube yang relevan dengan Cipanas
        </p>
      </div>

      {/* Info card */}
      <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
        <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100">
          📝 Panduan Upload Video
        </h3>
        <ul className="mt-2 space-y-1 text-xs text-blue-800 dark:text-blue-200">
          <li>• Cukup paste URL YouTube (video harus sudah upload di YouTube dulu)</li>
          <li>• Sistem otomatis ambil thumbnail dari YouTube</li>
          <li>• Video akan direview admin sebelum tayang (biasanya &lt; 24 jam)</li>
          <li>• Konten harus relevan dengan Cipanas atau bermanfaat untuk warga</li>
          <li>• Maksimal 3 video per hari per user</li>
        </ul>
      </div>

      <VideoUploadForm />
    </div>
  );
}