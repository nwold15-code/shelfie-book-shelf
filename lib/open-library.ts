// Helpers for talking to the free, keyless Open Library API.

export interface LookupResult {
  isbn: string;
  title: string;
  author: string;
  coverUrl: string | null;
}

function normalizeIsbn(raw: string): string {
  return raw.replace(/[^0-9Xx]/g, "").toUpperCase();
}

export async function lookupByIsbn(rawIsbn: string): Promise<LookupResult | null> {
  const isbn = normalizeIsbn(rawIsbn);
  if (!isbn) return null;

  const res = await fetch(
    `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`
  );
  if (!res.ok) throw new Error("Lookup request failed");
  const data = await res.json();
  const entry = data[`ISBN:${isbn}`];
  if (!entry) return null;

  const title: string = entry.title ?? "Unknown Title";
  const author: string = entry.authors?.[0]?.name ?? "Unknown Author";
  const coverUrl: string | null =
    entry.cover?.medium ?? entry.cover?.large ?? entry.cover?.small ?? null;

  return { isbn, title, author, coverUrl };
}

export interface AuthorWork {
  key: string;
  title: string;
  coverUrl: string | null;
  workUrl: string;
}

export async function searchWorksByAuthor(
  author: string,
  limit = 6
): Promise<AuthorWork[]> {
  const res = await fetch(
    `https://openlibrary.org/search.json?author=${encodeURIComponent(
      author
    )}&sort=rating&limit=${limit}&fields=key,title,cover_i,author_name`
  );
  if (!res.ok) return [];
  const data = await res.json();
  const docs: Array<Record<string, unknown>> = data.docs ?? [];
  return docs.map((doc) => {
    const key = String(doc.key ?? "");
    const coverId = doc.cover_i as number | undefined;
    return {
      key,
      title: String(doc.title ?? "Untitled"),
      coverUrl: coverId
        ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`
        : null,
      workUrl: `https://openlibrary.org$:{key}`,
    };
  });
}
