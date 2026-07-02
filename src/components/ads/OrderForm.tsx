// src/components/ads/OrderForm.tsx
"use client";

import { useActionState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import {
  createAdOrderClientSchema,
  type CreateAdOrderClientInput,
} from "@/lib/ad-schemas";
import { DURATION_PACKAGES, AD_SLOT_CONFIG } from "@/types/ad-order";
import { formatRupiah } from "@/lib/ad-utils";
import type { AdPosition } from "@prisma/client";
import { createAdOrderAction } from "@/actions/ad-order-actions";

export interface SerializedAdSlot {
  id: string;
  position: AdPosition;
  size: string;
  label: string | null;
  pricePerDay: number;
  isActive: boolean;
}

interface OrderFormProps {
  slots: SerializedAdSlot[];
}

// Helper: get tomorrow's date in YYYY-MM-DD format
function getTomorrowDate(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split("T")[0];
}

export function OrderForm({ slots }: OrderFormProps) {
  const [state, formAction, isPending] = useActionState(
    createAdOrderAction,
    null
  );

  const defaultStartDate = getTomorrowDate();

  const {
    register,
    control,
    watch,
    formState: { errors },
  } = useForm<CreateAdOrderClientInput>({
    resolver: zodResolver(createAdOrderClientSchema),
    defaultValues: {
      advertiserName: "",
      businessName: "",
      whatsappNumber: "",
      slotId: "",
      durationDays: 30,
      startDate: defaultStartDate,
    },
  });

  const selectedSlotId = watch("slotId");
  const selectedDuration = watch("durationDays");
  const selectedStartDate = watch("startDate");

  const selectedSlot = slots.find((s) => s.id === selectedSlotId);
  const estimatedPrice = selectedSlot
    ? selectedSlot.pricePerDay * Number(selectedDuration || 0)
    : 0;

  useEffect(() => {
    if (state && !state.success) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <form action={formAction} className="space-y-6">
      {/* Data Pengiklan */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Data Pengiklan
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="advertiserName"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Nama Anda *
            </label>
            <input
              {...register("advertiserName")}
              id="advertiserName"
              type="text"
              placeholder="Budi Santoso"
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.advertiserName && (
              <p className="mt-1 text-xs text-red-600">
                {errors.advertiserName.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="businessName"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Nama Bisnis / Brand *
            </label>
            <input
              {...register("businessName")}
              id="businessName"
              type="text"
              placeholder="Toko Budi Jaya"
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.businessName && (
              <p className="mt-1 text-xs text-red-600">
                {errors.businessName.message}
              </p>
            )}
          </div>
        </div>

        <div>
          <label
            htmlFor="whatsappNumber"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Nomor WhatsApp *
          </label>
          <input
            {...register("whatsappNumber")}
            id="whatsappNumber"
            type="tel"
            placeholder="08123456789"
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="mt-1 text-xs text-gray-500">
            Dipakai untuk koordinasi pembayaran & upload materi
          </p>
          {errors.whatsappNumber && (
            <p className="mt-1 text-xs text-red-600">
              {errors.whatsappNumber.message}
            </p>
          )}
        </div>
      </div>

      {/* Pilihan Iklan */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Paket Iklan
        </h2>

        {/* Posisi */}
        <Controller
          name="slotId"
          control={control}
          render={({ field }) => (
            <fieldset>
              <legend className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Posisi Iklan *
              </legend>
              <div className="grid gap-3 sm:grid-cols-2">
                {slots.map((slot) => {
                  const config = AD_SLOT_CONFIG[slot.position];
                  const isSelected = field.value === slot.id;

                  return (
                    <label
                      key={slot.id}
                      className={`
                        relative flex cursor-pointer rounded-xl border-2 p-4 transition-all
                        ${
                          isSelected
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                            : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                        }
                      `}
                    >
                      <input
                        type="radio"
                        name={`__rhf_${field.name}`}
                        value={slot.id}
                        checked={isSelected}
                        onChange={() => field.onChange(slot.id)}
                        onBlur={field.onBlur}
                        className="sr-only"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white text-sm">
                          {config?.label ?? slot.label ?? slot.position}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {slot.size} • {formatRupiah(slot.pricePerDay)}/hari
                        </p>
                        {config?.aspectRatioHint && (
                          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                            {config.aspectRatioHint}
                          </p>
                        )}
                      </div>
                      {isSelected && (
                        <svg
                          className="h-5 w-5 text-blue-500 shrink-0"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </label>
                  );
                })}
              </div>
              {errors.slotId && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.slotId.message}
                </p>
              )}
            </fieldset>
          )}
        />

        {/* Durasi */}
        <Controller
          name="durationDays"
          control={control}
          render={({ field }) => (
            <fieldset>
              <legend className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Durasi Tayang *
              </legend>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {DURATION_PACKAGES.map((pkg) => {
                  const isSelected = Number(field.value) === pkg.value;

                  return (
                    <label
                      key={pkg.value}
                      className={`
                        relative flex cursor-pointer rounded-lg border-2 p-3 text-center transition-all
                        ${
                          isSelected
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                            : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                        }
                      `}
                    >
                      <input
                        type="radio"
                        name={`__rhf_${field.name}`}
                        value={pkg.value}
                        checked={isSelected}
                        onChange={() => field.onChange(pkg.value)}
                        onBlur={field.onBlur}
                        className="sr-only"
                      />
                      <span
                        className={`w-full text-sm font-medium ${
                          isSelected
                            ? "text-blue-700 dark:text-blue-300"
                            : "text-gray-900 dark:text-white"
                        }`}
                      >
                        {pkg.label}
                      </span>
                    </label>
                  );
                })}
              </div>
              {errors.durationDays && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.durationDays.message}
                </p>
              )}
            </fieldset>
          )}
        />

        {/* Tanggal Mulai — pakai Controller juga */}
        <Controller
          name="startDate"
          control={control}
          render={({ field }) => (
            <div>
              <label
                htmlFor="startDate"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Tanggal Mulai Tayang *
              </label>
              <input
                id="startDate"
                type="date"
                min={defaultStartDate}
                value={field.value || ""}
                onChange={(e) => field.onChange(e.target.value)}
                onBlur={field.onBlur}
                className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.startDate && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.startDate.message}
                </p>
              )}
            </div>
          )}
        />
      </div>

      {/* ⚠️ Hidden inputs — WAJIB untuk FormData submit karena Controller tidak auto-serialize */}
      <input type="hidden" name="slotId" value={selectedSlotId || ""} />
      <input
        type="hidden"
        name="durationDays"
        value={String(selectedDuration ?? 30)}
      />
      <input
        type="hidden"
        name="startDate"
        value={selectedStartDate || defaultStartDate}
      />

      {/* Ringkasan Harga */}
      {selectedSlot && estimatedPrice > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-200 dark:border-blue-800 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Estimasi Total
              </p>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {formatRupiah(estimatedPrice)}
              </p>
            </div>
            <div className="text-right text-xs text-blue-600 dark:text-blue-400">
              <p>
                {AD_SLOT_CONFIG[selectedSlot.position]?.label ??
                  selectedSlot.position}
              </p>
              <p>{selectedDuration} hari</p>
            </div>
          </div>
          <p className="mt-2 text-xs text-blue-600 dark:text-blue-400">
            * Pembayaran dilakukan via transfer bank/e-wallet setelah pemesanan
          </p>
        </div>
      )}

      <button
        type="submit"
        disabled={isPending || !selectedSlotId || !selectedStartDate}
        className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold py-3 px-6 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        {isPending ? (
          <span className="flex items-center justify-center gap-2">
            <svg
              className="h-4 w-4 animate-spin"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Memproses...
          </span>
        ) : !selectedSlotId ? (
          "Pilih Posisi Iklan Dulu"
        ) : !selectedStartDate ? (
          "Pilih Tanggal Mulai"
        ) : (
          "Pesan Slot Iklan →"
        )}
      </button>
    </form>
  );
}