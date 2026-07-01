// src/components/dashboard/ProfileForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save, Upload, User as UserIcon, X } from "lucide-react";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";

import { profileSchema, type ProfileFormData } from "@/lib/profile-schema";

interface Props {
  initialData: {
    name: string;
    email: string;
    bio: string | null;
    image: string | null;
    role: string;
  };
}

export function ProfileForm({ initialData }: Props) {
  const router = useRouter();
  const { update: updateSession } = useSession();
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: initialData.name,
      bio: initialData.bio ?? "",
      image: initialData.image ?? "",
    },
  });

  const bioValue = watch("bio") ?? "";

  const uploadPhoto = async (file: File): Promise<string | null> => {
    if (!file.type.startsWith("image/")) {
      toast.error("File harus berupa gambar");
      return null;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Ukuran foto maksimal 2MB");
      return null;
    }

    setUploadingPhoto(true);
    try {
      const signRes = await fetch("/api/upload", { method: "POST" });
      if (!signRes.ok) throw new Error("Sign failed");
      const { signature, timestamp, folder, apiKey, cloudName } =
        await signRes.json();

      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", apiKey);
      formData.append("timestamp", String(timestamp));
      formData.append("signature", signature);
      formData.append("folder", folder);

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: "POST", body: formData }
      );

      if (!uploadRes.ok) throw new Error("Upload failed");
      const uploaded = await uploadRes.json();
      toast.success("Foto diunggah");
      return uploaded.secure_url;
    } catch (error) {
      console.error(error);
      toast.error("Gagal mengunggah foto");
      return null;
    } finally {
      setUploadingPhoto(false);
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error ?? "Gagal menyimpan");
        setSaving(false);
        return;
      }

      toast.success("Profil diperbarui");
      // Update session biar nama di navbar refresh
      await updateSession({ name: data.name, image: data.image });
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Terjadi kesalahan");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Photo */}
      <Controller
        control={control}
        name="image"
        render={({ field }) => (
          <div className="flex items-center gap-5">
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full bg-brand-100 dark:bg-brand-900/40">
              {field.value ? (
                <Image
                  src={field.value}
                  alt="Foto profil"
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <UserIcon className="h-10 w-10 text-brand-600 dark:text-brand-400" />
                </div>
              )}
            </div>

            <div className="flex-1">
              <div className="text-sm font-semibold text-neutral-900 dark:text-white">
                Foto Profil
              </div>
              <p className="mt-0.5 text-xs text-neutral-500">
                JPG/PNG, maksimal 2MB
              </p>
              <div className="mt-3 flex gap-2">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800">
                  {uploadingPhoto ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Upload className="h-3 w-3" />
                  )}
                  {uploadingPhoto ? "Mengunggah..." : "Unggah Foto"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploadingPhoto}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const url = await uploadPhoto(file);
                      if (url) field.onChange(url);
                      e.target.value = "";
                    }}
                  />
                </label>
                {field.value && (
                  <button
                    type="button"
                    onClick={() => field.onChange("")}
                    className="inline-flex items-center gap-1 rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:bg-red-950/30"
                  >
                    <X className="h-3 w-3" />
                    Hapus
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      />

      <hr className="border-neutral-200 dark:border-neutral-800" />

      {/* Email (read-only) */}
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-neutral-700 dark:text-neutral-300">
          Email
        </label>
        <input
          type="email"
          value={initialData.email}
          disabled
          className="w-full cursor-not-allowed rounded-lg border border-neutral-300 bg-neutral-50 px-4 py-2.5 text-sm text-neutral-500 dark:border-neutral-700 dark:bg-neutral-800"
        />
        <p className="mt-1 text-xs text-neutral-500">
          Email tidak dapat diubah.
        </p>
      </div>

      {/* Role (read-only) */}
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-neutral-700 dark:text-neutral-300">
          Role
        </label>
        <div className="inline-block rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
          {initialData.role}
        </div>
      </div>

      {/* Nama */}
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-neutral-700 dark:text-neutral-300">
          Nama Lengkap
        </label>
        <input
          type="text"
          className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
          {...register("name")}
        />
        {errors.name && (
          <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
        )}
      </div>

      {/* Bio */}
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-neutral-700 dark:text-neutral-300">
          Bio
        </label>
        <textarea
          rows={4}
          placeholder="Ceritakan sedikit tentang diri Anda..."
          className="w-full resize-y rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
          {...register("bio")}
        />
        <div className="mt-1 flex items-center justify-between text-xs">
          {errors.bio ? (
            <p className="text-red-500">{errors.bio.message}</p>
          ) : (
            <p className="text-neutral-500">
              Bio ini akan muncul di setiap artikel yang Anda tulis.
            </p>
          )}
          <span className="text-neutral-400">{bioValue.length}/500</span>
        </div>
      </div>

      {/* Submit */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Simpan Perubahan
        </button>
      </div>
    </form>
  );
}