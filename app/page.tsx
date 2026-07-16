"use client";

import { useCallback, useMemo, useState } from "react";
import { useBooks } from "@/lib/use-books";
import { lookupByIsbn } from "@/lib/open-library";
import { Book, Collection, COLLECTION_LABELS } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScannerDialog } from "@/components/scanner-dialog";
import { BookFormDialog } from "@/components/book-form-dialog";
import { LibraryStats } from "@/components/library-stats";
import { BookCard } from "@/components/book-card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ScanLine,
  Plus,
  Search,
  Loader2,
  AlertCircle,
  BookOpen,
  CheckSquare,
  X,
  Trash,
  ListChecks,
} from "lucide-react";

type SortMode = "series" | "author" | "recent" | "rating";
type FilterMode = "all" | "read" | "unread";

function amazonSearchUrl(query: string): string {
  return `https://www.amazon.com/s?k=${encodeURIComponent(query)}&i=stripbooks`;
}

export default function LibraryPage() {
  const {
    books,
    hydrated,
    addBook,
    updateBook,
    updateManyBooks,
    removeBook,
    removeManyBooks,
  } = useBooks();
  const [scannerOpen, setScannerOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [formInitial, setFormInitial] = useState<Partial<Book> | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("series");
  const [filterMode, setFilterMode] = useState<FilterMode>("all");
  const [genreFilter, setGenreFilter] = useState<string>("all");
  const [collectionFilter, setCollectionFilter] = useState<string>("all");
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const handleDetected = useCallback(
    async (isbn: string) => {
      const existing = books.find((b) => b.isbn === isbn.replace(/[^0-9Xx]/g, "").toUpperCase());
      if (existing) {
        setFormInitial(existing);
        setLookupError(`You already own "${existing.title}" — showing its details.`);
        setFormOpen(true);
        return;
      }

      setLookupLoading(true);
      setLookupError(null);
      try {
        const result = await lookupByIsbn(isbn);
        if (!result) {
          setFormInitial({ isbn });
          setLookupError(
            "No catalog match for that ISBN — fill in the details manually."
          );
        } else {
          setFormInitial({
            isbn: result.isbn,
            title: result.title,
            author: result.author,
            coverUrl: result.coverUrl,
            genres: result.genres,
            series: result.series,
            seriesIndex: result.seriesIndex,
          });
          if (!result.series) {
            setLookupError(
              "Added the book details — couldn't detect a series automatically, so add it manually if this is part of one."
            );
          }
        }
      } catch {
        setFormInitial({ isbn });
        setLookupError("Couldn't reach the book catalog — enter details manually.");
      } finally {
        setLookupLoading(false);
        setFormOpen(true);
      }
    },
    [books]
  );

  const allGenres = useMemo(() => {
    const set = new Set<string>();
    for (const b of books) {
      for (const g of b.genres ?? []) set.add(g);
    }
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [books]);

  const seriesGaps = useMemo(() => {
    const bySeries = new Map<string, number[]>();
    for (const b of books) {
      if (!b.series || b.seriesIndex == null) continue;
      if (b.collection !== "owned") continue;
      const arr = bySeries.get(b.series) ?? [];
      arr.push(b.seriesIndex);
      bySeries.set(b.series, arr);
    }
    const gaps: { series: string; missing: number[] }[] = [];
    for (const [series, indices] of bySeries.entries()) {
      const sorted = [...new Set(indices)].sort((a, b) => a - b);
      if (sorted.length < 2) continue;
      const min = sorted[0];
      const max = sorted[sorted.length - 1];
      const missing: number[] = [];
      for (let n = min; n <= max; n++) {
        if (!sorted.includes(n)) missing.push(n);
      }
      if (missing.length > 0) gaps.push({ series, missing });
    }
    return gaps;
  }, [books]);

  const filtered = useMemo(() => {
    let result = books;
    if (filterMode === "read") result = result.filter((b) => b.read);
    if (filterMode === "unread") result = result.filter((b) => !b.read);
    if (genreFilter !== "all") {
      result = result.filter((b) => (b.genres ?? []).includes(genreFilter));
    }
    if (collectionFilter !== "all") {
      result = result.filter((b) => b.collection === collectionFilter);
    }
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      result = result.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q) ||
          b.series.toLowerCase().includes(q)
      );
    }
    const sorted = [...result];
    switch (sortMode) {
      case "series":
        sorted.sort((a, b) => {
          const sa = a.series || "￿";
          const sb = b.series || "￿";
          if (sa !== sb) return sa.localeCompare(sb);
          return (a.seriesIndex ?? 0) - (b.seriesIndex ?? 0);
        });
        break;
      case "author":
        sorted.sort((a, b) => a.author.localeCompare(b.author));
        break;
      case "rating":
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      case "recent":
        sorted.sort(
          (a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
        );
        break;
    }
    return sorted;
  }, [books, query, sortMode, filterMode, genreFilter, collectionFilter]);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const exitSelectMode = () => {
    setSelectMode(false);
    setSelectedIds(new Set());
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-semibold text-[hsl(var(--forest))]">
            My Shelf
          </h1>
          <p className="text-[hsl(var(--forest-light))] mt-1 font-body">
            Scan a barcode and it lands right on the shelf.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setScannerOpen(true)}
            className="bg-[hsl(var(--burgundy))] hover:bg-[hsl(var(--burgundy-light))]"
          >
            {lookupLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <ScanLine className="h-4 w-4 mr-2" />
            )}
            Scan Barcode
          </Button>
          <Button
            variant="outline"
            className="border-[hsl(var(--forest))] text-[hsl(var(--forest))]"
            onClick={() => {
              setFormInitial(null);
              setFormOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" /> Add Manually
          </Button>
          <Button
            variant="outline"
            className="border-[hsl(var(--forest))] text-[hsl(var(--forest))]"
            onClick={() => (selectMode ? exitSelectMode() : setSelectMode(true))}
          >
            {selectMode ? (
              <X className="h-4 w-4 mr-2" />
            ) : (
              <CheckSquare className="h-4 w-4 mr-2" />
            )}
            {selectMode ? "Cancel" : "Select"}
          </Button>
        </div>
      </div>

      <LibraryStats books={books} />

      {seriesGaps.length > 0 && (
        <Alert className="border-[hsl(var(--gold))] bg-[hsl(var(--gold)/0.1)]">
          <ListChecks className="h-4 w-4" />
          <AlertDescription>
            <span className="font-medium">Missing from your series: </span>
            {seriesGaps.map((g, i) => (
              <span key={g.series}>
                {i > 0 && "; "}
                <a
                  href={amazonSearchUrl(`${g.series} book ${g.missing[0]}`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-[hsl(var(--burgundy))]"
                >
                  {g.series} #{g.missing.join(", #")}
                </a>
              </span>
            ))}
          </AlertDescription>
        </Alert>
      )}

      {lookupError && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{lookupError}</AlertDescription>
        </Alert>
      )}

      {selectMode && selectedIds.size > 0 && (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-[hsl(var(--forest)/0.2)] bg-white/60 p-3">
          <span className="text-sm font-medium text-[hsl(var(--forest))]">
            {selectedIds.size} selected
          </span>
          <Select
            onValueChange={(v) => updateManyBooks([...selectedIds], { collection: v as Collection })}
          >
            <SelectTrigger className="w-44 bg-white/70">
              <SelectValue placeholder="Move to shelf..." />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(COLLECTION_LABELS) as Collection[]).map((c) => (
                <SelectItem key={c} value={c}>
                  {COLLECTION_LABELS[c]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            className="border-[hsl(var(--burgundy))] text-[hsl(var(--burgundy))]"
            onClick={() => {
              removeManyBooks([...selectedIds]);
              exitSelectMode();
            }}
          >
            <Trash className="h-4 w-4 mr-2" /> Delete selected
          </Button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--forest-light))]" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search title, author, or series..."
            className="pl-9 bg-white/50"
          />
        </div>
        <Select value={sortMode} onValueChange={(v) => setSortMode(v as SortMode)}>
          <SelectTrigger className="sm:w-44 bg-white/50">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="series">Series &amp; order</SelectItem>
            <SelectItem value="author">Author</SelectItem>
            <SelectItem value="rating">Rating</SelectItem>
            <SelectItem value="recent">Recently added</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterMode} onValueChange={(v) => setFilterMode(v as FilterMode)}>
          <SelectTrigger className="sm:w-36 bg-white/50">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All books</SelectItem>
            <SelectItem value="read">Read</SelectItem>
            <SelectItem value="unread">To read</SelectItem>
          </SelectContent>
        </Select>
        <Select value={genreFilter} onValueChange={setGenreFilter}>
          <SelectTrigger className="sm:w-40 bg-white/50">
            <SelectValue placeholder="Genre" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All genres</SelectItem>
            {allGenres.map((genre) => (
              <SelectItem key={genre} value={genre}>
                {genre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={collectionFilter} onValueChange={setCollectionFilter}>
          <SelectTrigger className="sm:w-40 bg-white/50">
            <SelectValue placeholder="Shelf" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All shelves</SelectItem>
            {(Object.keys(COLLECTION_LABELS) as Collection[]).map((c) => (
              <SelectItem key={c} value={c}>
                {COLLECTION_LABELS[c]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!hydrated ? null : filtered.length === 0 ? (
        <div className="text-center py-20 rounded-xl border border-dashed border-[hsl(var(--forest)/0.3)]">
          <BookOpen className="h-8 w-8 mx-auto text-[hsl(var(--forest)/0.4)] mb-3" />
          <p className="font-display text-xl text-[hsl(var(--forest))]">
            {books.length === 0 ? "Your shelf is empty" : "No books match your search"}
          </p>
          <p className="text-sm text-[hsl(var(--forest-light))] mt-1">
            {books.length === 0
              ? "Scan a barcode or add a book manually to get started."
              : "Try a different search or filter."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              onToggleRead={(id, read) => updateBook(id, { read })}
              onRate={(id, rating) => updateBook(id, { rating })}
              onRemove={removeBook}
              onEdit={(b) => {
                setFormInitial(b);
                setFormOpen(true);
              }}
              selectMode={selectMode}
              selected={selectedIds.has(book.id)}
              onToggleSelect={toggleSelect}
            />
          ))}
        </div>
      )}

      <ScannerDialog
        open={scannerOpen}
        onOpenChange={setScannerOpen}
        onDetected={handleDetected}
      />
      <BookFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        initial={formInitial}
        onSave={(book) => {
          if (books.some((b) => b.id === book.id)) {
            updateBook(book.id, book);
          } else {
            addBook(book);
          }
        }}
        onDelete={removeBook}
      />
    </div>
  );
}
