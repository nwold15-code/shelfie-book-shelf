"use client";

import { useCallback, useEffect, useState } from "react";
import { Book } from "@/types";

const STORAGE_KEY = "shelfie-books-v1";

function loadBooks(): Book[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Book[]) : [];
  } catch {
    return [];
  }
}

function saveBooks(books: Book[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
}

export function useBooks() {
  const [books, setBooks] = useState<Book[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setBooks(loadBooks());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveBooks(books);
  }, [books, hydrated]);

  const addBook = useCallback((book: Book) => {
    setBooks((prev) => {
      if (prev.some((b) => b.isbn === book.isbn)) return prev;
      return [book, ...prev];
    });
  }, []);

  const updateBook = useCallback((id: string, patch: Partial<Book>) => {
    setBooks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...patch } : b))
    );
  }, []);

  const removeBook = useCallback((id: string) => {
    setBooks((prev) => prev.filter((b) => b.id !== id));
  }, []);

  return { books, hydrated, addBook, updateBook, removeBook };
}
