export type Collection = "owned" | "wishlist" | "lent" | "donate";

export const COLLECTION_LABELS: Record<Collection, string> = {
  owned: "Owned",
  wishlist: "Wishlist",
  lent: "Lent Out",
  donate: "To Donate",
};

export interface Book {
  id: string;
  isbn: string;
  title: string;
  author: string;
  series: string;
  seriesIndex: number | null;
  coverUrl: string | null;
  read: boolean;
  rating: number; // 0-5
  genres: string[];
  collection: Collection;
  addedAt: string;
}

export interface RecommendedBook {
  key: string;
  title: string;
  author: string;
  coverUrl: string | null;
  reason: string;
  workUrl: string;
  buyUrl: string;
  readable: boolean;
}
