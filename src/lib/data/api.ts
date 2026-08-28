// Mock data access layer. Every function is async and takes the backend
// language code so that swapping to the real API later only means replacing
// function bodies with fetch(API_URL, { headers: { "Accept-Language": lang } }).
import { pickLang } from "@/lib/i18n-lang";
import type {
  AuthorDto,
  BannerDto,
  BookDto,
  BookFixture,
  BookFormat,
  BookLangCode,
  CollectionDto,
  GenreDto,
  Lang,
  SeriesDto,
} from "@/lib/types";
import { authors } from "./fixtures/authors";
import { banners } from "./fixtures/banners";
import { books } from "./fixtures/books";
import { collections, series } from "./fixtures/collections";
import { genres } from "./fixtures/genres";
import { bookLanguages } from "./fixtures/languages";

export interface BookQuery {
  search?: string;
  genreIds?: number[];
  langCodes?: BookLangCode[];
  formats?: BookFormat[];
  free?: boolean;
  isNew?: boolean;
  bestseller?: boolean;
  yearFrom?: number;
  yearTo?: number;
  sort?: "az" | "yearNew" | "yearOld" | "popular";
}

export const YEAR_MIN = 1990;
export const YEAR_MAX = 2026;
const BESTSELLER_DOWNLOADS = 900;
const NEW_SINCE = "2026-01-01";

function flattenAuthor(id: number, lang: Lang): AuthorDto {
  const a = authors.find((x) => x.id === id)!;
  return {
    id: a.id,
    name: pickLang(a.name, lang),
    bio: pickLang(a.bio, lang),
    image: a.image,
  };
}

function flattenBook(b: BookFixture, lang: Lang): BookDto {
  const language = bookLanguages.find((l) => l.id === b.languageId)!;
  return {
    id: b.id,
    name: pickLang(b.name, lang),
    description: pickLang(b.description, lang),
    image: b.image,
    age: b.age,
    year: b.year,
    page_count: b.page_count,
    price: b.price,
    is_subscription_only: false,
    recomended: b.recomended,
    top_of_the_week: b.top_of_the_week,
    view_count: b.view_count,
    download_count: b.download_count,
    language: {
      id: language.id,
      code: language.code,
      name: pickLang(language.name, lang),
    },
    authors: b.authorIds.map((id) => flattenAuthor(id, lang)),
    genres: b.genreIds.map((id) => {
      const g = genres.find((x) => x.id === id)!;
      return { id: g.id, name: pickLang(g.name, lang) };
    }),
    formats: b.formats,
  };
}

export async function getBooks(
  query: BookQuery,
  lang: Lang,
): Promise<BookDto[]> {
  let result = books.slice();

  if (query.genreIds?.length) {
    result = result.filter((b) =>
      b.genreIds.some((id) => query.genreIds!.includes(id)),
    );
  }
  if (query.langCodes?.length) {
    result = result.filter((b) => {
      const code = bookLanguages.find((l) => l.id === b.languageId)!.code;
      return query.langCodes!.includes(code);
    });
  }
  if (query.formats?.length) {
    result = result.filter((b) =>
      b.formats.some((f) => query.formats!.includes(f)),
    );
  }
  if (query.free) {
    result = result.filter((b) => b.price === 0);
  }
  if (query.isNew) {
    result = result.filter((b) => b.created_at >= NEW_SINCE);
  }
  if (query.bestseller) {
    result = result.filter((b) => b.download_count >= BESTSELLER_DOWNLOADS);
  }
  if (query.yearFrom !== undefined) {
    result = result.filter((b) => b.year >= query.yearFrom!);
  }
  if (query.yearTo !== undefined) {
    result = result.filter((b) => b.year <= query.yearTo!);
  }

  let flattened = result.map((b) => flattenBook(b, lang));

  if (query.search) {
    const q = query.search.toLowerCase();
    flattened = flattened.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.authors.some((a) => a.name.toLowerCase().includes(q)),
    );
  }

  switch (query.sort) {
    case "az":
      flattened.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "yearNew":
      flattened.sort((a, b) => b.year - a.year);
      break;
    case "yearOld":
      flattened.sort((a, b) => a.year - b.year);
      break;
    case "popular":
    default:
      flattened.sort((a, b) => b.view_count - a.view_count);
      break;
  }

  return flattened;
}

export async function getBook(
  id: number,
  lang: Lang,
): Promise<BookDto | null> {
  const b = books.find((x) => x.id === id);
  return b ? flattenBook(b, lang) : null;
}

export async function getBooksByIds(
  ids: number[],
  lang: Lang,
): Promise<BookDto[]> {
  return books
    .filter((b) => ids.includes(b.id))
    .map((b) => flattenBook(b, lang));
}

export async function getPopularBooks(lang: Lang): Promise<BookDto[]> {
  return books
    .slice()
    .sort((a, b) => b.view_count - a.view_count)
    .slice(0, 8)
    .map((b) => flattenBook(b, lang));
}

export async function getEditorsPick(lang: Lang): Promise<BookDto[]> {
  return books
    .filter((b) => b.recomended)
    .slice(0, 4)
    .map((b) => flattenBook(b, lang));
}

export async function getNewArrivals(lang: Lang): Promise<BookDto[]> {
  return books
    .slice()
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, 8)
    .map((b) => flattenBook(b, lang));
}

export async function getWeeklyTop(lang: Lang): Promise<BookDto[]> {
  return books
    .filter((b) => b.top_of_the_week)
    .map((b) => flattenBook(b, lang));
}

export async function getBestsellers(lang: Lang): Promise<BookDto[]> {
  return books
    .filter((b) => b.download_count >= BESTSELLER_DOWNLOADS)
    .sort((a, b) => b.download_count - a.download_count)
    .map((b) => flattenBook(b, lang));
}

export async function getTrialBooks(lang: Lang): Promise<BookDto[]> {
  return books.filter((b) => b.price === 0).map((b) => flattenBook(b, lang));
}

export async function getSimilarBooks(
  bookId: number,
  lang: Lang,
): Promise<BookDto[]> {
  const b = books.find((x) => x.id === bookId);
  if (!b) return [];
  return books
    .filter(
      (x) =>
        x.id !== bookId && x.genreIds.some((g) => b.genreIds.includes(g)),
    )
    .slice(0, 6)
    .map((x) => flattenBook(x, lang));
}

export async function getBooksByAuthor(
  authorId: number,
  lang: Lang,
  excludeBookId?: number,
): Promise<BookDto[]> {
  return books
    .filter((b) => b.authorIds.includes(authorId) && b.id !== excludeBookId)
    .map((b) => flattenBook(b, lang));
}

export async function getAuthors(lang: Lang): Promise<AuthorDto[]> {
  return authors.map((a) => flattenAuthor(a.id, lang));
}

export async function getGenres(lang: Lang): Promise<GenreDto[]> {
  return genres.map((g) => ({ id: g.id, name: pickLang(g.name, lang) }));
}

export async function getBanners(lang: Lang): Promise<BannerDto[]> {
  return banners
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((b) => ({
      id: b.id,
      title: pickLang(b.title, lang),
      subtitle: pickLang(b.subtitle, lang),
      badge: b.badge ? pickLang(b.badge, lang) : null,
      website_image: b.website_image,
      link: b.link,
      book_id: b.book_id,
      order: b.order,
    }));
}

export async function getCollections(lang: Lang): Promise<CollectionDto[]> {
  return collections.map((c) => ({
    id: c.id,
    name: pickLang(c.name, lang),
    sub_title: pickLang(c.sub_title, lang),
    icon: c.icon,
    bookIds: c.bookIds,
  }));
}

export async function getSeries(lang: Lang): Promise<SeriesDto[]> {
  return series.map((s) => ({
    id: s.id,
    name: pickLang(s.name, lang),
    image: s.image,
    bookIds: s.bookIds,
  }));
}
