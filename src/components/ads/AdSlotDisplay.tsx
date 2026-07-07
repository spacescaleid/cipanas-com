import { PrismaClient, type AdPosition } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";

class PrismaSingleton {
  private static instance: PrismaClient;

  static getInstance() {
    if (!this.instance) {
      this.instance = new PrismaClient();
    }
    return this.instance;
  }
}

const prisma = PrismaSingleton.getInstance();

type AdSlotDisplayProps = {
  position?: AdPosition;
  slotId?: string;
  className?: string;
};

export async function AdSlotDisplay({
  position,
  slotId,
  className,
}: AdSlotDisplayProps) {
  const now = new Date();

  const ad = await prisma.adOrder.findFirst({
    where: {
      status: "ACTIVE",
      imageUrl: { not: null },
      targetUrl: { not: null },
      startDate: { lte: now },
      endDate: { gte: now },
      ...(slotId ? { slotId } : {}),
      ...(position ? { slot: { position, isActive: true } } : {}),
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      imageUrl: true,
      targetUrl: true,
      altText: true,
      slot: {
        select: {
          size: true,
          label: true,
          position: true,
        },
      },
    },
  });

  if (!ad?.imageUrl || !ad?.targetUrl) return null;

  return (
    <Link
      href={ad.targetUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={
        className ??
        "block overflow-hidden rounded-xl shadow-sm transition-shadow hover:shadow-md"
      }
    >
      <div className="relative w-full overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-800">
        <div className="relative aspect-[16/5] w-full">
          <Image
            src={ad.imageUrl}
            alt={ad.altText ?? ad.slot.label ?? "Advertisement"}
            fill
            className="object-cover"
          />
        </div>
      </div>
    </Link>
  );
}

export default AdSlotDisplay;