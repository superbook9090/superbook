export interface PublicBlogItem {
  _id: string;
  title: string;
  slug: string;
  topic: string;
  language: string;
  excerpt: string;
  metaTitle: string;
  metaDescription: string;
  author?: { _id: string; name: string | null };
  createdAt: string;
  updatedAt: string;
  isFeatured: boolean;
  viewCount: number;
  readingTimeMinutes: number;
}

export interface BlogPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export type BlogSortType = 'latest' | 'popular' | 'quick';
export type BlogLanguageType = 'all' | 'en' | 'hi';
