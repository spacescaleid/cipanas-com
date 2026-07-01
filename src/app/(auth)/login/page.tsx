// src/app/(auth)/login/page.tsx
import { Suspense } from "react";
import type { Metadata } from "next";

import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Masuk — Cipanas.com",
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-center">Memuat...</div>}>
      <LoginForm />
    </Suspense>
  );
}