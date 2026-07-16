"use client";

import { Book } from "@/types";
import { BookOpen, Check, Star, Layers } from "lucide-react";

interface LibraryStatsProps {
  books: Book[];
}

export function LibraryStats({ books }: LibraryStatsProps) {
  const total = books.length;
  const read = books.filter((b) => b.read).length;
  const rated = books.filter((b) => b.rating > 0);
  const avgRating = rated.length
    ? (rated.reduce((sum, b) => sum + b.rating, 0) / rated.length).toFixed(1)
    : "—";
  const seriesCount = new Set(
    books.filter((b) => b.series).map((b) => b.series)
  ).size;

  const stats = [
    { label: "Books owned", value: total, icon: BookOpen },
    { label: "Finished", value: read, icon: Check },
    { label: "Avg rating", value: avgRating, icon: Star },
    { label: "Series", value: seriesCount, icon: Layers },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {stats.map((s) => (
        <div
          key={s.label}
          className="rounded-xl border border-[hsl(var(--forest)/0.15)] bg-white/40 p-4 flex items-center gap-3 book-spine-shadow"
        >
          <div className="rounded-full bg-[hsl(var(--forest)/0.12)] p-2 text-[hsl(var(--forest))]">
            <s.icon className="h-4 w-4" />
          </div>
          <div>
            <p className="font-display text-xl leading-none">{s.value}</p>
            <p className="text-xs text-[hsl(var(--forest-light))]">{s.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
