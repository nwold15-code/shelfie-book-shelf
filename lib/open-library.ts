// Helpers for talking to the free, keyless Open Library API.

export interface LookupResult {
  isbn: string;
  title: string;
  author: string;
  coverUrl: string | null;
  genres: string[];
  series: string;
  seriesIndex: number | null;
}

function normalizeIsbn(raw: string): string {
  return raw.replace(/[^0-9Xx]/g, "").toUpperCase();
}

function extractGenres(entry: Record<string, unknown>): string[] {
  const subjects = entry.subjects as Array<{ name?: string }> | undefined;
  if (!subjects || !Array.isArray(subjects)) return [];
  return subjects
    .map((s) => s?.name)
    .filter((name): name is string => Boolean(name))
    .slice(0, 3);
}

// Tries to pull "Series Name" + "#N" out of a raw series string like
// "Harry Potter ;bk. 1", "Harry Potter, Book 1", or just "Harry Potter".
function parseSeriesString(raw: string): { name: string; index: number | null } {
  const trailingNumber = raw.match(
    /^(.*?)[,;]?\s*(?:#|bk\.?|book|vol\.?|volume)\s*(\d+)\s*$/i
  );
  if (trailingNumber) {
    return {
      name: trailingNumber[1].trim().replace(/[,;]+$/, ""),
      index: Number(trailingNumber[2]),
    };
  }
  return { name: raw.trim(), index: null };
}

// Tries to pull series info out of a title like:
// "The Fellowship of the Ring (The Lord of the Rings, #1)"
// "The Fellowship of the Ring (The Lord of the Rings Book 1)"
function parseSeriesFromTitle(
  title: string
): { name: string; index: number | null } | null {
  const match = title.match(
    /\(([^()]+?)[,]?\s*(?:#|book\s+|vol(?:ume)?\.?\s+)(\d+)\)\s*$/i
  );
  if (!match) return null;
  return { name: match[1].trim(), index: Number(match[2]) };
}

async function fetchEditionSeries(isbn: string): Promise<string | null> {
  try {
    const res = await fetch(`https://openlibrary.org/isbn/${isbn}.json`);
    if (!res.ok) return null;
    const data = await res.json();
    const series = data.series as string[] | undefined;
    if (series && series.length > 0) return series[0];
    return null;
  } catch {
    return null;
  }
}

export async function lookupByIsbn(rawIsbn: string): Promise<LookupResult | null> {
  const isbn = normalizeIsbn(rawIsbn);
  if (!isbn) return null;

  const [dataRes, editionSeriesRaw] = await Promise.all([
    fetch(
      `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`
    ),
    fetchEditionSeries(isbn),
  ]);

  if (!dataRes.ok) throw new Error("Lookup request failed");
  const data = await dataRes.json();
  const entry = data[`ISBN:${isbn}`];
  if (!entry) return null;

  const title: string = entry.title ?? "Unknown Title";
  const author: string = entry.authors?.[0]?.name ?? "Unknown Author";
  const coverUrl: string | null =
    entry.cover?.medium ?? entry.cover?.large ?? entry.cover?.small ?? null;
  const genres = extractGenres(entry);

  // Prefer series info parsed from the title (usually includes both name and
  // number), then fall back to the edition record's raw series field.
  const fromTitle = parseSeriesFromTitle(title);
  const fromEdition = editionSeriesRaw ? parseSeriesString(editionSeriesRaw) : null;

  const series = fromTitle?.name ?? fromEdition?.name ?? "";
  const seriesIndex = fromTitle?.index ?? fromEdition?.index ?? null;

  return { isbn, title, author, coverUrl, genres, series, seriesIndex };
}

export interface AuthorWork {
  key: string;
  title: string;
  coverUrl: string | null;
  workUrl: string;
  readable: boolean;
}

export async function searchWorksByAuthor(
  author: string,
  limit = 6
): Promise<AuthorWork[]> {
  const res = await fetch(
    `https://openlibrary.org/search.json?author=${encodeURIComponent(
      author
    )}&sort=rating&limit=${limit}&fields=key,title,cover_i,author_name,ebook_access`
  );
  if (!res.ok) return [];
  const data = await res.json();
  const docs: Array<Record<string, unknown>> = data.docs ?? [];
  return docs.map((doc) => {
    const key = String(doc.key ?? "");
    const coverId = doc.cover_i as number | undefined;
    const ebookAccess = doc.ebook_access as string | undefined;
    return {
      key,
      title: String(doc.title ?? "Untitled"),
      coverUrl: coverId
        ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`
        : null,
      workUrl: `https://openlibrary.org${key}`,
      readable: ebookAccess === "public" || ebookAccess === "borrowable",
    };
  });
}

function slugifySubject(subject: string): string {
  return subject
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export async function searchWorksByGenre(
  genre: string,
  limit = 6
): Promise<AuthorWork[]> {
  const slug = slugifySubject(genre);
  if (!slug) return [];
  try {
    const res = await fetch(
      `https://openlibrary.org/subjects/${slug}.json?limit=${limit}`
    );
    if (!res.ok) return [];
    const data = await res.json();
    const works: Array<Record<string, unknown>> = data.works ?? [];
    return works.map((w) => {
      const key = String(w.key ?? "");
      const coverId = w.cover_id as number | undefined;
      const authors = w.authors as Array<{ name?: string }> | undefined;
      const ia = w.ia as string[] | undefined;
      return {
        key,
        title: String(w.title ?? "Untitled"),
        coverUrl: coverId
          ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`
          : null,
        workUrl: `https://openlibrary.org${key}`,
        readable: Array.isArray(ia) && ia.length > 0,
        author: authors?.[0]?.name ?? "",
      } as AuthorWork & { author: string };
    });
  } catch {
    return [];
  }
}
