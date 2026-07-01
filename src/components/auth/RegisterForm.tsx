// src/components/auth/RegisterForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { Loader2, User, Mail, Lock } from "lucide-react";

const registerSchema = z
  .object({
    name: z.string().min(2, "Nama minimal 2 karakter").max(80),
    email: z.string().email("Email tidak valid"),
    password: z.string().min(6, "Password minimal 6 karakter"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Konfirmasi password tidak cocok",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error ?? "Registrasi gagal");
        setIsLoading(false);
        return;
      }

      toast.success("Registrasi berhasil! Sedang login...");

      const signInRes = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (signInRes?.ok) {
        router.push("/dashboard");
        router.refresh();
      } else {
        router.push("/login");
      }
    } catch (error) {
      console.error(error);
      toast.error("Terjadi kesalahan, coba lagi");
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-card dark:border-neutral-800 dark:bg-neutral-900">
      <div className="mb-6 text-center">
        <h1 className="font-serif text-3xl font-bold text-neutral-900 dark:text-white">
          Daftar
        </h1>
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
          Bergabung sebagai kontributor Cipanas.com
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label
            htmlFor="name"
            className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
          >
            Nama Lengkap
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              id="name"
              type="text"
              autoComplete="name"
              placeholder="Nama Anda"
              className="w-full rounded-lg border border-neutral-300 bg-white py-2.5 pl-10 pr-3 text-sm text-neutral-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
              {...register("name")}
            />
          </div>
          {errors.name && (
            <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="email"
            className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
          >
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="nama@email.com"
              className="w-full rounded-lg border border-neutral-300 bg-white py-2.5 pl-10 pr-3 text-sm text-neutral-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
              {...register("email")}
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
          >
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="Minimal 6 karakter"
              className="w-full rounded-lg border border-neutral-300 bg-white py-2.5 pl-10 pr-3 text-sm text-neutral-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
              {...register("password")}
            />
          </div>
          {errors.password && (
            <p className="mt-1 text-xs text-red-500">
              {errors.password.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
          >
            Konfirmasi Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="Ulangi password"
              className="w-full rounded-lg border border-neutral-300 bg-white py-2.5 pl-10 pr-3 text-sm text-neutral-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
              {...register("confirmPassword")}
            />
          </div>
          {errors.confirmPassword && (
            <p className="mt-1 text-xs text-red-500">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          {isLoading ? "Mendaftarkan..." : "Daftar"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-neutral-600 dark:text-neutral-400">
        Sudah punya akun?{" "}
        <Link
          href="/login"
          className="font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
        >
          Masuk di sini
        </Link>
      </p>
    </div>
  );
}