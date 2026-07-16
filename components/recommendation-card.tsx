"use client";

import { RecommendedBook } from "@/types";
import { BookCover } from "@/components/book-cover";
import { ExternalLink } from "lucide-react";

export function RecommendationCard({ book }: { book: RecommendedBook }) {
  return (
    <a
      href={book.workUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="animate-rise group flex gap-4 rounded-xl border border-[hsl(var(--forest)/0.15)] bg-white/40 p-3 book-spine-shadow hover:bg-white/60 transition-colors"
    >
      <div className="w-16 h-24 rounded-md overflow-hidden shrink-0 book-spine-shadow">
        <BookCover coverUrl={book.coverUrl} title={book.title} className="w-full h-full" />
      </div>
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          <p className="font-display text-lg font-medium leading-tight group-hover:text-[hsl(var(--burgundy))] transition-colors">
            {book.title}
          </p>
          <p className="text-sm text-[hsl(var(--forest-light))]">{book.author}</p>
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs uppercase tracking-wide text-[hsl(var(--burgundy))]">
            {book.reason}
          </span>
          <ExternalLink className="h-3.5 w-3.5 text-[hsl(var(--forest-light))] opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
    </a>
  );
}
