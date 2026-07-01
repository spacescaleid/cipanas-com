// src/components/article/AuthorCard.tsx
import Image from "next/image";
import { User as UserIcon } from "lucide-react";

interface Props {
  name: string;
  image: string | null;
  bio: string | null;
}

export function AuthorCard({ name, image, bio }: Props) {
  return (
    <div className="mt-10 flex gap-4 rounded-xl border border-neutral-200 bg-neutral-50 p-6 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-brand-100 dark:bg-brand-900/40">
        {image ? (
          <Image
            src={image}
            alt={name}
            fill
            sizes="56px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <UserIcon className="h-6 w-6 text-brand-600 dark:text-brand-400" />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
          Ditulis oleh
        </div>
        <div className="mt-0.5 font-serif text-lg font-bold text-neutral-900 dark:text-white">
          {name}
        </div>
        {bio && (
          <p className="mt-1 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
            {bio}
          </p>
        )}
      </div>
    </div>
  );
}