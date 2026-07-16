"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StarRating } from "@/components/star-rating";
import { BookCover } from "@/components/book-cover";
import { Book } from "@/types";
import { Trash } from "lucide-react";

interface BookFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial: Partial<Book> | null;
  onSave: (book: Book) => void;
  onDelete?: (id: string) => void;
}

function emptyBook(): Book {
  return {
    id: crypto.randomUUID(),
    isbn: "",
    title: "",
    author: "",
    series: "",
    seriesIndex: null,
    coverUrl: null,
    read: false,
    rating: 0,
    addedAt: new Date().toISOString(),
  };
}

export function BookFormDialog({
  open,
  onOpenChange,
  initial,
  onSave,
  onDelete,
}: BookFormDialogProps) {
  const [draft, setDraft] = useState<Book>(emptyBook());

  useEffect(() => {
    if (open) {
      setDraft({ ...emptyBook(), ...initial });
    }
  }, [open, initial]);

  const isEdit = Boolean(initial?.id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">
            {isEdit ? "Edit book" : "Add a book"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex gap-4">
          <div className="w-16 h-24 rounded-md overflow-hidden shrink-0 book-spine-shadow">
            <BookCover coverUrl={draft.coverUrl} title={draft.title} className="w-full h-full" />
          </div>
          <div className="flex-1 space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              placeholder="The Fellowship of the Ring"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="author">Author</Label>
          <Input
            id="author"
            value={draft.author}
            onChange={(e) => setDraft({ ...draft, author: e.target.value })}
            placeholder="J.R.R. Tolkien"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="series">Series</Label>
            <Input
              id="series"
              value={draft.series}
              onChange={(e) => setDraft({ ...draft, series: e.target.value })}
              placeholder="The Lord of the Rings"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="seriesIndex">Book #</Label>
            <Input
              id="seriesIndex"
              type="number"
              min={0}
              value={draft.seriesIndex ?? ""}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  seriesIndex: e.target.value ? Number(e.target.value) : null,
                })
              }
              placeholder="1"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="isbn">ISBN</Label>
          <Input
            id="isbn"
            value={draft.isbn}
            onChange={(e) => setDraft({ ...draft, isbn: e.target.value })}
            placeholder="9780000000000"
            className="font-mono"
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Label>Your rating</Label>
            <StarRating
              size="md"
              value={draft.rating}
              onChange={(v) => setDraft({ ...draft, rating: v })}
            />
          </div>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={draft.read}
              onChange={(e) => setDraft({ ...draft, read: e.target.checked })}
              className="accent-[hsl(var(--forest))] h-4 w-4"
            />
            Read
          </label>
        </div>

        <DialogFooter className="flex items-center sm:justify-between gap-2">
          {isEdit && onDelete ? (
            <Button
              variant="ghost"
              className="text-[hsl(var(--burgundy))] hover:text-[hsl(var(--burgundy))]"
              onClick={() => {
                onDelete(draft.id);
                onOpenChange(false);
              }}
            >
              <Trash className="h-4 w-4 mr-1" /> Delete
            </Button>
          ) : (
            <span />
          }
          <Button
            disabled={!draft.title.trim() || !draft.author.trim()}
            onClick={() => {
              onSave({
                ...draft,
                isbn: draft.isbn || crypto.randomUUID(),
              });
              onOpenChange(false);
            }}
            className="bg-[hsl(var(--forest))] hover:bg-[hsl(var(--forest-light))]"
          >
            Save book
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
