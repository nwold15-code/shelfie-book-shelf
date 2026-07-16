"use client";

import { useEffect, useMemo, useState } from "react";
import { useBooks } from "@/lib/use-books";
import { searchWorksByAuthor, searchWorksByGenre } from "@/lib/open-library";
import { Book, RecommendedBook } from "@/types";
import { RecommendationCard } from "@/components/recommendation-card";
import { Loader2, Sparkles, BookOpen, AlertCircle, Tag } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

function amazonSearchUrl(title: string, author: string): string {
  const query = `${title} ${author}`.trim();
  return `https://www.amazon.com/s?k=${encodeURIComponent(query)}&i=stripbooks`;
}

function makeWishlistBook(rec: RecommendedBook): Book {
  return {
    id: crypto.randomUUID(),
    isbn: rec.key || crypto.randomUUID(),
    title: rec.title,
    author: rec.author,
    series: "",
    seriesIndex: null,
    coverUrl: rec.coverUrl,
    read: false,
    rating: 0,
    genres: [],
    collection: "wishlist",
    addedAt: new Date().toISOString(),
  };
}

export default function RecommendationsPage() {
  const { books, hydrated, addBook } = useBooks();
  const [recs, setRecs] = useState<RecommendedBook[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);

  const topAuthors = useMemo(() => {
    const score = new Map<string, number>();
    for (const b of books) {
      if (!b.author) continue;
      const base = b.rating > 0 ? b.rating : 3;
      score.set(b.author, (score.get(b.author) ?? 0) + base);
    }
    return [...score.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([author]) => author);
  }, [books]);

  const allGenres = useMemo(() => {
    const set = new Set<string>();
    for (const b of books) {
      for (const g of b.genres ?? []) set.add(g);
    }
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [books]);

  const autoTopGenres = useMemo(() => {
    const score = new Map<string, number>();
    for (const b of books) {
      const base = b.rating > 0 ? b.rating : 3;
      for (const g of b.genres ?? []) {
        score.set(g, (score.get(g) ?? 0) + base);
      }
    }
    return [...score.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([genre]) => genre);
  }, [books]);

  const activeGenres = selectedGenres.length > 0 ? selectedGenres : autoTopGenres;

  const toggleGenre = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  useEffect(() => {
    if (!hydrated) return;
    if (topAuthors.length === 0 && activeGenres.length === 0) {
      setRecs([]);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const ownedTitles = new Set(
          books.map((b) => b.title.trim().toLowerCase())
        );
        const results: RecommendedBook[] = [];
        const seenKeys = new Set<string>();

        for (const author of topAuthors) {
          const works = await searchWorksByAuthor(author, 8);
          const fresh = works.filter(
            (w) => !ownedTitles.has(w.title.trim().toLowerCase())
          );
          for (const w of fresh.slice(0, 3)) {
            if (seenKeys.has(w.key)) continue;
            seenKeys.add(w.key);
            results.push({
              key: w.key,
              title: w.title,
              author,
              coverUrl: w.coverUrl,
              reason: `Because you enjoy ${author}`,
              workUrl: w.workUrl,
              buyUrl: amazonSearchUrl(w.title, author),
              readable: w.readable,
            });
          }
        }

        for (const genre of activeGenres) {
          const works = await searchWorksByGenre(genre, 8);
          const fresh = works.filter(
            (w) => !ownedTitles.has(w.title.trim().toLowerCase())
          );
          for (const w of fresh.slice(0, 4)) {
            if (seenKeys.has(w.key)) continue;
            seenKeys.add(w.key);
            const author = (w as unknown as { author?: string }).author ?? "";
            results.push({
              key: w.key,
              title: w.title,
              author,
              coverUrl: w.coverUrl,
              reason: `Popular in ${genre}`,
              workUrl: w.workUrl,
              buyUrl: amazonSearchUrl(w.title, author),
              readable: w.readable,
            });
          }
        }

        if (!cancelled) setRecs(results);
      } catch {
        if (!cancelled) {
          setError(
            "Couldn't reach the book catalog for recommendations. Try again shortly."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [hydrated, topAuthors, activeGenres, books]);

  const wishlistedKeys = useMemo(
    () => new Set(books.filter((b) => b.collection === "wishlist").map((b) => b.isbn)),
    [books]
  );

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">
      <div>
        <h1 className="font-display text-4xl font-semibold text-[hsl(var(--forest))] flex items-center gap-3">
          <Sparkles className="h-7 w-7 text-[hsl(var(--burgundy))]" />
          Discover
        </h1>
        <p className="text-[hsl(var(--forest-light))] mt-1 font-body">
          Fresh picks pulled from Open Library, based on the authors and genres already on your shelf.
        </p>
      </div>

      {allGenres.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1 text-xs uppercase tracking-wide text-[hsl(var(--forest-light))] mr-1">
            <Tag className="h-3.5 w-3.5" /> Genres:
          </span>
          {allGenres.map((genre) => {
            const active = selectedGenres.includes(genre);
            return (
              <button
                key={genre}
                onClick={() => toggleGenre(genre)}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium transition-colors border",
                  active
                    ? "bg-[hsl(var(--forest))] text-[hsl(var(--parchment))] border-[hsl(var(--forest))]"
                    : "bg-white/50 text-[hsl(var(--forest))] border-[hsl(var(--forest)/0.25)] hover:bg-white/80"
                )}
              >
                {genre}
              </button>
            );
          })}
          {selectedGenres.length > 0 && (
            <button
              onClick={() => setSelectedGenres([])}
              className="text-xs text-[hsl(var(--burgundy))] hover:underline"
            >
              Reset
            </button>
          )}
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!hydrated || loading ? (
        <div className="flex items-center justify-center py-24 text-[hsl(var(--forest-light))]">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          Finding books you might love...
        </div>
      ) : topAuthors.length === 0 && activeGenres.length === 0 ? (
        <div className="text-center py-20 rounded-xl border border-dashed border-[hsl(var(--forest)/0.3)]">
          <BookOpen className="h-8 w-8 mx-auto text-[hsl(var(--forest)/0.4)] mb-3" />
          <p className="font-display text-xl text-[hsl(var(--forest))]">
            Add a few books first
          </p>
          <p className="text-sm text-[hsl(var(--forest-light))] mt-1">
            Scan or add books on your shelf, and recommendations will appear here.
          </p>
        </div>
      ) : recs.length === 0 ? (
        <div className="text-center py-20 rounded-xl border border-dashed border-[hsl(var(--forest)/0.3)]">
          <p className="font-display text-xl text-[hsl(var(--forest))]">
            No new recommendations right now
          </p>
          <p className="text-sm text-[hsl(var(--forest-light))] mt-1">
            Looks like you already own the top picks from your favorite authors and genres.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recs.map((book) => (
            <RecommendationCard
              key={book.key || book.title}
              book={book}
              added={wishlistedKeys.has(book.key)}
              onAddToWishlist={(rec) => addBook(makeWishlistBook(rec))}
            />
          ))}
        </div>
      )}
    </div>
  );
}
