// src/app/admin/iklan/[id]/AdminAdActions.tsx
"use client";

import {
  useState,
  useActionState,
  useEffect,
  useTransition,
  useRef,
} from "react";
import toast from "react-hot-toast";
import {
  verifyPaymentAction,
  approveCreativeAction,
  rejectCreativeAction,
  expireOrderAction,
} from "@/actions/admin-ad-actions";
import { buildUploadInviteMessage, buildWhatsAppLink } from "@/lib/ad-utils";
import { CopyButton } from "@/components/ui/CopyButton";
import type { AdOrderStatus } from "@/types/ad-order";

interface VerifyResult {
  uploadLink: string;
  uploadTokenExpiresAt: Date;
  waMessage: string;
}

interface AdminAdActionsProps {
  orderId: string;
  orderCode: string;
  status: AdOrderStatus;
  advertiserName: string | null;
  whatsappNumber: string | null;
  existingUploadToken?: string | null;
  existingTokenExpiry?: string | null;
}

// Helper: build initial verify result dari props (untuk lazy init state)
function buildInitialVerifyResult(params: {
  status: AdOrderStatus;
  existingUploadToken?: string | null;
  existingTokenExpiry?: string | null;
  advertiserName: string;
  orderCode: string;
}): VerifyResult | null {
  const { status, existingUploadToken, existingTokenExpiry, advertiserName, orderCode } = params;

  if (typeof window === "undefined") return null;
  if (status !== "AWAITING_CREATIVE" || !existingUploadToken || !existingTokenExpiry) {
    return null;
  }

  const baseUrl = window.location.origin;
  const uploadLink = `${baseUrl}/upload-iklan/${existingUploadToken}`;
  const expiryDate = new Date(existingTokenExpiry);
  const waMessage = buildUploadInviteMessage({
    advertiserName,
    orderCode,
    uploadLink,
    tokenExpiresAt: expiryDate,
  });

  return {
    uploadLink,
    uploadTokenExpiresAt: expiryDate,
    waMessage,
  };
}

export function AdminAdActions({
  orderId,
  orderCode,
  status,
  advertiserName,
  whatsappNumber,
  existingUploadToken,
  existingTokenExpiry,
}: AdminAdActionsProps) {
  const [isPending, startTransition] = useTransition();

  // Normalize nullable values ke string dengan fallback
  const safeAdvertiserName = advertiserName ?? "Pengiklan";
  const safeWhatsappNumber = whatsappNumber ?? "";

  // Lazy init verify result (tidak pakai useEffect + setState)
  const [verifyResult, setVerifyResult] = useState<VerifyResult | null>(() =>
    buildInitialVerifyResult({
      status,
      existingUploadToken,
      existingTokenExpiry,
      advertiserName: safeAdvertiserName,
      orderCode,
    })
  );

  const [showRejectForm, setShowRejectForm] = useState(false);

  // ─── Verifikasi Pembayaran ───────────────────────────────────────────
  const handleVerifyPayment = () => {
    startTransition(async () => {
      const result = await verifyPaymentAction(orderId);
      if (result.success) {
        toast.success("Pembayaran berhasil diverifikasi!");
        const baseUrl = window.location.origin;
        const uploadLink = `${baseUrl}/upload-iklan/${result.data.uploadToken}`;
        const waMessage = buildUploadInviteMessage({
          advertiserName: safeAdvertiserName,
          orderCode,
          uploadLink,
          tokenExpiresAt: result.data.uploadTokenExpiresAt,
        });
        setVerifyResult({
          uploadLink,
          uploadTokenExpiresAt: result.data.uploadTokenExpiresAt,
          waMessage,
        });
      } else {
        toast.error(result.error);
      }
    });
  };

  // ─── Approve ─────────────────────────────────────────────────────────
  const handleApprove = () => {
    if (!confirm("Setujui materi iklan ini dan aktifkan iklan?")) return;
    startTransition(async () => {
      const result = await approveCreativeAction(orderId);
      if (result.success) {
        toast.success("Iklan disetujui dan sekarang aktif tayang!");
        window.location.reload();
      } else {
        toast.error(result.error);
      }
    });
  };

  // ─── Expire ──────────────────────────────────────────────────────────
  const handleExpire = () => {
    if (!confirm("Tandai order ini sebagai kadaluarsa?")) return;
    startTransition(async () => {
      const result = await expireOrderAction(orderId);
      if (result.success) {
        toast.success("Order ditandai kadaluarsa");
        window.location.reload();
      } else {
        toast.error(result.error);
      }
    });
  };

  // ─── Reject Form ─────────────────────────────────────────────────────
  const [rejectState, rejectFormAction, isRejectPending] = useActionState(
    rejectCreativeAction,
    null
  );

  // Track processed reject state — hindari re-process saat re-render
  const processedRejectStateRef = useRef<typeof rejectState>(null);

  useEffect(() => {
    // Skip kalau rejectState belum berubah dari sebelumnya
    if (rejectState === processedRejectStateRef.current) return;
    processedRejectStateRef.current = rejectState;

    if (rejectState?.success) {
      toast.success("Materi ditolak. Pengiklan bisa upload ulang.");
      // Wrap setState di startTransition untuk hindari cascading render warning
      startTransition(() => {
        setShowRejectForm(false);
      });
      window.location.reload();
    } else if (rejectState && !rejectState.success && rejectState.error) {
      toast.error(rejectState.error);
    }
  }, [rejectState]);

  return (
    <div className="space-y-4">
      {/* ─── Verifikasi Pembayaran ─────────────────────────────────────── */}
      {status === "PENDING_PAYMENT" && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-5">
          <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
            Verifikasi Pembayaran
          </h3>
          <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-4">
            Pastikan Anda sudah mengecek mutasi rekening atau chat WA dari
            pengiklan sebelum verifikasi.
          </p>
          <button
            onClick={handleVerifyPayment}
            disabled={isPending}
            className="bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-400 text-white font-semibold py-2 px-5 rounded-lg transition-colors text-sm"
          >
            {isPending ? "Memproses..." : "✓ Verifikasi Pembayaran"}
          </button>
        </div>
      )}

      {/* ─── Link Upload ────────────────────────────────────────────────── */}
      {verifyResult && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-5 space-y-4">
          <div>
            <p className="text-sm font-semibold text-green-900 dark:text-green-100 mb-1">
              ✅ Pembayaran Terverifikasi — Link Upload Siap
            </p>
            <p className="text-xs text-green-700 dark:text-green-300">
              Kirim link ini ke pengiklan via WhatsApp secara manual.
            </p>
          </div>

          <div>
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              Link Upload Materi:
            </p>
            <div className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2">
              <p className="text-sm font-mono text-gray-900 dark:text-white flex-1 truncate">
                {verifyResult.uploadLink}
              </p>
              <CopyButton text={verifyResult.uploadLink} label="Salin Link" />
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
              Atau salin pesan lengkap untuk dikirim ke pengiklan:
            </p>
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
              <pre className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-sans">
                {verifyResult.waMessage}
              </pre>
            </div>
            <div className="flex gap-2 mt-2">
              <CopyButton
                text={verifyResult.waMessage}
                label="Salin Pesan WA"
              />
              {safeWhatsappNumber && (
                <a
                  href={buildWhatsAppLink(
                    verifyResult.waMessage,
                    safeWhatsappNumber
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs bg-[#25D366] hover:bg-[#1da851] text-white font-semibold py-1 px-3 rounded-lg transition-colors"
                >
                  Buka WA Pengiklan
                </a>
              )}
            </div>
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-3">
            <p className="text-xs text-amber-800 dark:text-amber-200">
              ⚠️ <strong>Keterbatasan:</strong> WhatsApp tidak memungkinkan
              pengiriman pesan otomatis tanpa WhatsApp Business API (berbayar).
              Anda perlu menyalin pesan di atas dan mengirimnya secara manual
              ke pengiklan. Tombol &quot;Buka WA Pengiklan&quot; akan membuka
              WhatsApp dengan nomor pengiklan, tapi pesan perlu di-paste secara
              manual.
            </p>
          </div>
        </div>
      )}

      {/* ─── Review Materi ──────────────────────────────────────────────── */}
      {status === "PENDING_REVIEW" && (
        <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-5 space-y-3">
          <h3 className="font-semibold text-purple-900 dark:text-purple-100">
            Review Materi Iklan
          </h3>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleApprove}
              disabled={isPending}
              className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-2 px-5 rounded-lg transition-colors text-sm"
            >
              {isPending ? "Memproses..." : "✓ Setujui & Aktifkan"}
            </button>
            <button
              onClick={() => setShowRejectForm(!showRejectForm)}
              disabled={isPending}
              className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold py-2 px-5 rounded-lg transition-colors text-sm"
            >
              ✕ Tolak Materi
            </button>
          </div>

          {showRejectForm && (
            <form action={rejectFormAction} className="space-y-3 pt-2">
              <input type="hidden" name="orderId" value={orderId} />
              <div>
                <label
                  htmlFor="rejectionReason"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Alasan Penolakan *
                </label>
                <textarea
                  id="rejectionReason"
                  name="rejectionReason"
                  rows={3}
                  placeholder="Contoh: Ukuran gambar tidak sesuai (harus 728×90px), konten mengandung klaim berlebihan, dsb."
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <button
                type="submit"
                disabled={isRejectPending}
                className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold py-2 px-5 rounded-lg transition-colors text-sm"
              >
                {isRejectPending ? "Memproses..." : "Kirim Penolakan"}
              </button>
            </form>
          )}
        </div>
      )}

      {/* ─── Expire Manual ───────────────────────────────────────────────── */}
      {["PENDING_PAYMENT", "AWAITING_CREATIVE", "ACTIVE"].includes(status) && (
        <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4">
          <p className="text-xs text-gray-500 mb-2">Aksi Darurat</p>
          <button
            onClick={handleExpire}
            disabled={isPending}
            className="text-xs text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 border border-gray-300 dark:border-gray-600 hover:border-red-300 py-1.5 px-3 rounded-lg transition-colors"
          >
            Tandai Kedaluarsa
          </button>
        </div>
      )}
    </div>
  );
}