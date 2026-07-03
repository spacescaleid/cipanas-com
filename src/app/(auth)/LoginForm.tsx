// src/components/auth/LoginForm.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { Loader2, Mail, Lock } from "lucide-react";

import { getDefaultRouteForRole } from "@/lib/auth-utils";

const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

type LoginFormData = z.infer<typeof loginSchema>;

/**
 * Map NextAuth error code / custom message ke pesan Indonesia yang readable.
 */
function getErrorMessage(error: string | null): string | null {
  if (!error) return null;

  // Kalau error mengandung "Terlalu banyak" (dari RateLimitError kita), tampilkan apa adanya
  if (error.includes("Terlalu banyak")) {
    return error;
  }

  // Default: kredensial salah / error lain
  return "Email atau password salah";
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const urlError = searchParams.get("error");
  const [isLoading, setIsLoading] = useState(false);

  // Ref untuk cegah duplicate toast dari query param error
  const shownUrlErrorRef = useRef<string | null>(null);

  // Tampilkan error dari URL query param (dari NextAuth redirect)
  useEffect(() => {
    if (urlError && shownUrlErrorRef.current !== urlError) {
      shownUrlErrorRef.current = urlError;
      const message = getErrorMessage(urlError);
      if (message) {
        toast.error(message);
      }
    }
  }, [urlError]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);

    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    setIsLoading(false);

    if (result?.error) {
      // result.error bisa berupa custom message dari RateLimitError,
      // atau default "CredentialsSignin" dari NextAuth
      const message = getErrorMessage(result.error);
      toast.error(message ?? "Login gagal, coba lagi.");
      return;
    }

    if (result?.ok) {
      toast.success("Login berhasil!");

      // Kalau ada callbackUrl (dari middleware redirect), pakai itu
      if (callbackUrl) {
        router.push(callbackUrl);
      } else {
        // Fetch session untuk dapetin role, lalu redirect
        const sessionRes = await fetch("/api/auth/session");
        const session = await sessionRes.json();
        const target = session?.user?.role
          ? getDefaultRouteForRole(session.user.role)
          : "/";
        router.push(target);
      }

      router.refresh();
    }
  };

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-card dark:border-neutral-800 dark:bg-neutral-900">
      <div className="mb-6 text-center">
        <h1 className="font-serif text-3xl font-bold text-neutral-900 dark:text-white">
          Masuk
        </h1>
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
          Selamat datang kembali di Cipanas.com
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email */}
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

        {/* Password */}
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
              autoComplete="current-password"
              placeholder="••••••••"
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

        <button
          type="submit"
          disabled={isLoading}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          {isLoading ? "Memproses..." : "Masuk"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-neutral-600 dark:text-neutral-400">
        Belum punya akun?{" "}
        <Link
          href="/register"
          className="font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
        >
          Daftar di sini
        </Link>
      </p>
    </div>
  );
}