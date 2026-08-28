// Language code used by the backend API (Accept-Language header).
// Note: URL locale "tm" maps to backend "tk" — see lib/i18n-lang.ts.
export type Lang = "tk" | "tr" | "ru";

// Same shape as the backend MultilanguageDto — used only inside fixtures;
// components always receive flattened (single-language) DTOs.
export type MultiLang = Record<Lang, string>;

export type BookFormat = "EPUB" | "PDF" | "MOBI" | "CBZ";

export type BookLangCode = "tk" | "tr" | "ru" | "en" | "other";

export interface GenreDto {
  id: number;
  name: string;
}

export interface AuthorDto {
  id: number;
  name: string;
  bio: string;
  image: string | null;
}

export interface BookLanguageDto {
  id: number;
  code: BookLangCode;
  name: string;
}

/** A downloadable file attached to a book (only the detail endpoint has these). */
export interface BookFileDto {
  id: number;
  file_key: string;
  /** Upper-cased extension, e.g. "PDF" */
  format: string;
  /** Bytes */
  size: number;
}

export interface BookDto {
  id: number;
  name: string;
  description: string;
  image: string;
  age: number;
  year: number;
  page_count: number;
  /** Price in manat; 0 = free (synag) */
  price: number;
  /** Readable only with an active subscription (in the mobile app); not purchasable. */
  is_subscription_only: boolean;
  recomended: boolean;
  top_of_the_week: boolean;
  view_count: number;
  download_count: number;
  /** Absent on real-API responses (the detail endpoint has no language). */
  language?: BookLanguageDto;
  authors: AuthorDto[];
  genres: GenreDto[];
  formats: BookFormat[];
  /** Only populated by the detail endpoint; drives the download buttons. */
  files?: BookFileDto[];
}

export interface BannerDto {
  id: number;
  title: string;
  subtitle: string;
  badge: string | null;
  website_image: string;
  /** Locale-relative path, e.g. "/books?free=1" */
  link: string | null;
  book_id: number | null;
  order: number;
}

export interface CollectionDto {
  id: number;
  name: string;
  sub_title: string;
  /** Emoji shown in the collection card chip */
  icon: string;
  bookIds: number[];
}

// Frontend-only for now — the backend has no Series entity yet.
export interface SeriesDto {
  id: number;
  name: string;
  image: string;
  bookIds: number[];
}

/**
 * Lightweight book snapshot persisted in cart/wishlist/orders stores.
 * Stored at add-time so items resolve regardless of data source (mock or
 * real API). price is null when unknown (collection summaries carry none).
 */
export interface BookSnapshot {
  id: number;
  name: string;
  image: string | null;
  price: number | null;
  authors: string;
}

// ---- Fixture (mock source) shapes: multilang before flattening ----

export interface BookFixture {
  id: number;
  name: MultiLang;
  description: MultiLang;
  image: string;
  age: number;
  year: number;
  page_count: number;
  price: number;
  recomended: boolean;
  top_of_the_week: boolean;
  view_count: number;
  download_count: number;
  languageId: number;
  authorIds: number[];
  genreIds: number[];
  formats: BookFormat[];
  /** ISO date the book was added — drives "new arrivals" sorting */
  created_at: string;
}

export interface AuthorFixture {
  id: number;
  name: MultiLang;
  bio: MultiLang;
  image: string | null;
}

export interface GenreFixture {
  id: number;
  name: MultiLang;
}

export interface BookLanguageFixture {
  id: number;
  code: BookLangCode;
  name: MultiLang;
}

export interface BannerFixture {
  id: number;
  title: MultiLang;
  subtitle: MultiLang;
  badge: MultiLang | null;
  website_image: string;
  link: string | null;
  book_id: number | null;
  order: number;
}

export interface CollectionFixture {
  id: number;
  name: MultiLang;
  sub_title: MultiLang;
  icon: string;
  bookIds: number[];
}

export interface SeriesFixture {
  id: number;
  name: MultiLang;
  image: string;
  bookIds: number[];
}
