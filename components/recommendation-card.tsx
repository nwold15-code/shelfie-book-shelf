"use client";

import { RecommendedBook } from "@/types";
import { BookCover } from "@/components/book-cover";
import { ExternalLink, ShoppingCart, BookOpenCheck } from "lucide-react";

export function RecommendationCard({ book }: { book: RecommendedBook }) {
  return (
    <div className="animate-rise group flex gap-4 rounded-xl border border-[hsl(var(--forest)/0.15)] bg-white/40 p-3 book-spine-shadow hover:bg-white/60 transition-colors">
      <a
        href={book.workUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="w-16 h-24 rounded-md overflow-hidden shrink-0 book-spine-shadow"
      >
        <BookCover coverUrl={book.coverUrl} title={book.title} className="w-full h-full" />
      </a>
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <a href={book.workUrl} target="_blank" rel="noopener noreferrer">
          <p className="font-display text-lg font-medium leading-tight group-hover:text-[hsl(var(--burgundy))] transition-colors">
            {book.title}
          </p>
          {book.author && (
            <p className="text-sm text-[hsl(var(--forest-light))]">{book.author}</p>
          )}
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs uppercase tracking-wide text-[hsl(var(--burgundy))] truncate">
              {book.reason}
            </span>
            {book.readable && (
              <span className="flex items-center gap-1 text-[10px] uppercase tracking-wide rounded-full bg-[hsl(var(--forest)/0.12)] text-[hsl(var(--forest))] px-2 py-0.5 shrink-0">
                <BookOpenCheck className="h-3 w-3" /> Read Free
              </span>
            )}
          </div>
        </a>
        <div className="flex items-center justify-end mt-2 gap-2">
          <a
            href={book.workUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-[hsl(var(--forest-light))] hover:text-[hsl(var(--forest))] transition-colors"
            title="View on Open Library"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
          <a
            href={book.buyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 rounded-full bg-[hsl(var(--burgundy))] text-[hsl(var(--parchment))] px-3 py-1 text-xs font-medium hover:bg-[hsl(var(--burgundy-light))] transition-colors"
          >
            <ShoppingCart className="h-3 w-3" /> Buy
          </a>
        </div>
      </div>
    </div>
  );
}
