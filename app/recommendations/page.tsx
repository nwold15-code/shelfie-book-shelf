"use client";

import { useEffect, useMemo, useState } from "react";
import { useBooks } from "@/lib/use-books";
import { searchWorksByAuthor } from "@/lib/open-library";
import { RecommendedBook } from "@/types";
import { RecommendationCard } from "@/components/recommendation-card";
import { Loader2, Sparkles, BookOpen, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

function amazonSearchUrl(title: string, author: string): string {
  const query = `${title} ${author}`.trim();
  return `https://www.amazon.com/s?k=${encodeURIComponent(query)}&i=stripbooks`;
}

export default function RecommendationsPage() {
  const { books, hydrated } = useBooks();
  const [recs, setRecs] = useState<RecommendedBook[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    if (!hydrated) return;
    if (topAuthors.length === 0) {
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

        for (const author of topAuthors) {
          const works = await searchWorksByAuthor(author, 8);
          const fresh = works.filter(
            (w) => !ownedTitles.has(w.title.trim().toLowerCase())
          );
          for (const w of fresh.slice(0, 3)) {
            results.push({
              key: w.key,
              title: w.title,
              author,
              coverUrl: w.coverUrl,
              reason: `Because you enjoy ${author}`,
              workUrl: w.workUrl,
              buyUrl: amazonSearchUrl(w.title, author),
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
  }, [hydrated, topAuthors, books]);

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">
      <div>
        <h1 className="font-display text-4xl font-semibold text-[hsl(var(--forest))] flex items-center gap-3">
          <Sparkles className="h-7 w-7 text-[hsl(var(--burgundy))]" />
          Discover
        </h1>
        <p className="text-[hsl(var(--forest-light))] mt-1 font-body">
          Fresh picks pulled from Open Library, based on the authors already on your shelf.
        </p>
      </div>

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
      ) : topAuthors.length === 0 ? (
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
            Looks like you already own the top picks from your favorite authors.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recs.map((book) => (
            <RecommendationCard key={book.key || book.title} book={book} />
          ))}
        </div>
      )}
    </div>
  );
}
