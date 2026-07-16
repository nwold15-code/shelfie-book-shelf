"use client";

import { Check, Trash, BookOpen } from "lucide-react";
import { Book, COLLECTION_LABELS } from "@/types";
import { StarRating } from "@/components/star-rating";
import { BookCover } from "@/components/book-cover";
import { cn } from "@/lib/utils";

interface BookCardProps {
  book: Book;
  onToggleRead: (id: string, read: boolean) => void;
  onRate: (id: string, rating: number) => void;
  onRemove: (id: string) => void;
  onEdit: (book: Book) => void;
  selectMode?: boolean;
  selected?: boolean;
  onToggleSelect?: (id: string) => void;
}

export function BookCard({
  book,
  onToggleRead,
  onRate,
  onRemove,
  onEdit,
  selectMode = false,
  selected = false,
  onToggleSelect,
}: BookCardProps) {
  return (
    <div className="animate-rise group relative flex gap-4 rounded-xl border border-[hsl(var(--forest)/0.15)] bg-white/40 p-3 book-spine-shadow hover:bg-white/60 transition-colors">
      {selectMode && (
        <button
          onClick={() => onToggleSelect?.(book.id)}
          className={cn(
            "absolute top-2 left-2 z-10 h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors",
            selected
              ? "bg-[hsl(var(--forest))] border-[hsl(var(--forest))]"
              : "bg-white/80 border-[hsl(var(--forest)/0.4)]"
          )}
          aria-label={selected ? "Deselect book" : "Select book"}
        >
          {selected && <Check className="h-3 w-3 text-[hsl(var(--parchment))]" />}
        </button>
      )}
      <button
        onClick={() => (selectMode ? onToggleSelect?.(book.id) : onEdit(book))}
        className="shrink-0 w-16 h-24 rounded-md overflow-hidden book-spine-shadow"
        aria-label="Edit book details"
      >
        <BookCover coverUrl={book.coverUrl} title={book.title} className="w-full h-full" />
      </button>

      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          <button
            onClick={() => (selectMode ? onToggleSelect?.(book.id) : onEdit(book))}
            className="text-left font-display text-lg font-medium leading-tight text-[hsl(var(--ink))] hover:text-[hsl(var(--burgundy))] transition-colors"
          >
            {book.title}
          </button>
          <p className="text-sm text-[hsl(var(--forest-light))] font-body">
            {book.author}
          </p>
          {book.series && (
            <p className="text-xs uppercase tracking-wide text-[hsl(var(--burgundy))] mt-1">
              {book.series}
              {book.seriesIndex != null ? ` · Book ${book.seriesIndex}` : ""}
            </p>
          )}
          <div className="flex flex-wrap gap-1 mt-1.5">
            {book.collection && book.collection !== "owned" && (
              <span className="text-[10px] uppercase tracking-wide rounded-full bg-[hsl(var(--burgundy)/0.12)] text-[hsl(var(--burgundy))] px-2 py-0.5">
                {COLLECTION_LABELS[book.collection]}
              </span>
            )}
            {(book.genres ?? []).map((genre) => (
              <span
                key={genre}
                className="text-[10px] uppercase tracking-wide rounded-full bg-[hsl(var(--forest)/0.1)] text-[hsl(var(--forest))] px-2 py-0.5"
              >
                {genre}
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between mt-2">
          <StarRating value={book.rating} onChange={(v) => onRate(book.id, v)} />
          <div className="flex items-center gap-1">
            <button
              onClick={() => onToggleRead(book.id, !book.read)}
              className={cn(
                "flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
                book.read
                  ? "bg-[hsl(var(--forest))] text-[hsl(var(--parchment))]"
                  : "bg-[hsl(var(--forest)/0.1)] text-[hsl(var(--forest))]"
              )}
            >
              {book.read ? <Check className="h-3 w-3" /> : <BookOpen className="h-3 w-3" />}
              {book.read ? "Read" : "To Read"}
            </button>
            <button
              onClick={() => onRemove(book.id)}
              className="p-1.5 rounded-full text-[hsl(var(--burgundy))] opacity-0 group-hover:opacity-100 hover:bg-[hsl(var(--burgundy)/0.1)] transition-all"
              aria-label="Remove book"
            >
              <Trash className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
