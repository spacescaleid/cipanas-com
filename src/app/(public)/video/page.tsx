// src/app/(public)/video/page.tsx
import type { Metadata } from "next";
import { PlayCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Video — Cipanas.com",
  description: "Kumpulan video berita dan liputan Cipanas.",
};

const dummyVideos = [
  {
    id: "1",
    title: "Liputan Festival Kuliner Cipanas 2024",
    thumbnail: "https://picsum.photos/seed/vid1/640/360",
    duration: "5:24",
    views: "2.3K",
  },
  {
    id: "2",
    title: "Wawancara Eksklusif Bupati Cianjur",
    thumbnail: "https://picsum.photos/seed/vid2/640/360",
    duration: "12:08",
    views: "5.1K",
  },
  {
    id: "3",
    title: "Tur Wisata Alam Cipanas: Curug Cikondang",
    thumbnail: "https://picsum.photos/seed/vid3/640/360",
    duration: "8:45",
    views: "8.7K",
  },
  {
    id: "4",
    title: "Aksi Solidaritas Warga Cipanas untuk Korban Bencana",
    thumbnail: "https://picsum.photos/seed/vid4/640/360",
    duration: "3:12",
    views: "1.8K",
  },
  {
    id: "5",
    title: "Panen Raya Petani Kopi Cipanas",
    thumbnail: "https://picsum.photos/seed/vid5/640/360",
    duration: "6:30",
    views: "3.4K",
  },
  {
    id: "6",
    title: "Highlight Piala Bupati: Semifinal Cipanas FC",
    thumbnail: "https://picsum.photos/seed/vid6/640/360",
    duration: "9:18",
    views: "11K",
  },
];

export default function VideoPage() {
  return (
    <div className="animate-fade-in">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="mb-8 border-b border-neutral-200 pb-6 dark:border-neutral-800">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
            Video
          </div>
          <h1 className="font-serif text-4xl font-bold text-neutral-900 dark:text-white md:text-5xl">
            Video Berita
          </h1>
          <p className="mt-3 text-neutral-600 dark:text-neutral-400">
            Kumpulan liputan video Cipanas.com
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {dummyVideos.map((video) => (
            <article
              key={video.id}
              className="group cursor-pointer overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-card transition hover:shadow-card-hover dark:border-neutral-800 dark:bg-neutral-900"
            >
              <div className="relative aspect-video overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition group-hover:opacity-100">
                  <PlayCircle className="h-16 w-16 text-white" />
                </div>
                <div className="absolute bottom-2 right-2 rounded bg-black/80 px-2 py-0.5 text-xs font-medium text-white">
                  {video.duration}
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-serif text-base font-bold leading-snug text-neutral-900 group-hover:text-brand-700 dark:text-white dark:group-hover:text-brand-400">
                  {video.title}
                </h3>
                <p className="mt-2 text-xs text-neutral-500">{video.views} views</p>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-10 rounded-xl border border-dashed border-neutral-300 p-8 text-center text-sm text-neutral-500 dark:border-neutral-700">
          Fitur upload & manajemen video akan tersedia di update mendatang.
        </div>
      </div>
    </div>
  );
}