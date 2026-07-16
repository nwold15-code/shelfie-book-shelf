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
}
