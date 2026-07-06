import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";

interface Props {
  position: "HEADER" | "SIDEBAR" | "INLINE" | "FOOTER";
}

/**
 * Dimensi iklan per posisi.
 * Pattern konsisten dengan AdRotator.tsx:
 * - max-w + max-h di elemen yang SAMA (wrapper <Link>)
 * - Image pakai object-contain agar gambar UTUH tidak dipotong
 * - Tidak pakai aspect-ratio hero-banner besar
 *
 * Target tampilan: banner tipis a la Kompas.com — kompak, gambar utuh.
 */
const AD_DIMENSIONS: Record<
  Props["position"],
  {
    maxWidthClass: string;
    maxHeightClass: string;
    width: number;
    height: number;
    sizes: string;
  }
> = {
  HEADER: {
    maxWidthClass: "max-w-[970px]",
    maxHeightClass: "max-h-[120px]",
    width: 970,
    height: 120,
    sizes: "(max-width: 768px) 100vw, 970px",
  },
  FOOTER: {
    maxWidthClass: "max-w-[970px]",
    maxHeightClass: "max-h-[120px]",
    width: 970,
    height: 120,
    sizes: "(max-width: 768px) 100vw, 970px",
  },
  SIDEBAR: {
    maxWidthClass: "max-w-[300px]",
    maxHeightClass: "max-h-[320px]",
    width: 300,
    height: 250,
    sizes: "300px",
  },
  INLINE: {
    maxWidthClass: "max-w-[728px]",
    maxHeightClass: "max-h-[120px]",
    width: 728,
    height: 90,
    sizes: "(max-width: 640px) 100vw, 728px",
  },
};

/**
 * Tampilkan iklan aktif dari posisi tertentu.
 * Server component — fetch dari DB, pilih satu random kalau ada banyak.
 */
export async function AdSlotDisplay({ position }: Props) {
  const ads = await prisma.adOrder.findMany({
    where: {
      status: "ACTIVE",
      slot: { position },
      startDate: { lte: new Date() },
      endDate: { gte: new Date() },
    },
    select: {
      id: true,
      imageUrl: true,
      linkUrl: true,
      altText: true,
    },
  });

  if (ads.length === 0) return null;

  // Pilih random
  const ad = ads[Math.floor(Math.random() * ads.length)];

  if (!ad.imageUrl) return null;

  const { maxWidthClass, maxHeightClass, width, height, sizes } =
    AD_DIMENSIONS[position];

  return (
    <div className="w-full flex justify-center my-2">
      {/*
       * max-w & max-h WAJIB di elemen yang sama supaya constraint tinggi ter-enforce.
       * overflow-hidden mencegah gambar overflow keluar batas.
       */}
      <Link
        href={ad.linkUrl ?? "#"}
        target="_blank"
        rel="noopener noreferrer"
        className={`block w-full ${maxWidthClass} ${maxHeightClass} overflow-hidden`}
      >
        <Image
          src={ad.imageUrl}
          alt={ad.altText ?? "Iklan"}
          width={width}
          height={height}
          sizes={sizes}
          className="h-auto w-full object-contain"
          priority={position === "HEADER"}
        />
      </Link>
    </div>
  );
}