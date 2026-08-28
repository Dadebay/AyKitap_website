// Typed fetchers for the real API (home collections, banners, book detail).
// All fetchers are fail-soft: on any error they resolve to empty/null.
import { localizedText } from "@/lib/i18n-lang";
import type { BookDto, BookFormat, Lang } from "@/lib/types";
import { apiFetch, resolveMediaUrl } from "./http";

export interface ApiAuthorRef {
  id: number;
  name: string;
  image: string | null;
}

export interface ApiBookSummary {
  id: number;
  name: string;
  image: string | null;
  year: number | null;
  age: number | null;
  authors: ApiAuthorRef[];
}

export type CollectionCardType = "card_1" | "card_2" | "card_3" | "card_4";

export interface ApiCollection {
  id: number;
  queue_position: number;
  type: "book" | "author";
  card_type: CollectionCardType;
  name: string;
  sub_title: string | null;
  image: string | null;
  books: ApiBookSummary[];
  authors: ApiAuthorRef[];
}

export interface ApiBanner {
  id: number;
  name: string;
  website_image: string | null;
  link: string | null;
  book_id: number | null;
}

// ---- raw wire shapes (before null-guarding / media resolution) ----

/** Text columns are jsonb: normally flattened by Accept-Language, but a row
 * can still arrive as the raw {tk,tr,ru} object — see localizedText(). */
type ApiText = string | Record<string, string> | null;

interface RawAuthorRef {
  id: number;
  name: ApiText;
  image: string | null;
}

interface RawBookSummary {
  id: number;
  name: ApiText;
  image: string | null;
  year: number | null;
  age: number | null;
  authors: RawAuthorRef[] | null;
}

interface RawCollection {
  id: number;
  queue_position: number | null;
  type: string | null;
  card_type: string | null;
  name: ApiText;
  sub_title: ApiText;
  image: string | null;
  books: RawBookSummary[] | null;
  authors: RawAuthorRef[] | null;
}

interface RawBanner {
  id: number;
  name: string | null;
  website_image: string | null;
  link: string | null;
  book_id: number | null;
  order: number | null;
}

export interface RawBookListItem {
  id: number;
  name: ApiText;
  description: ApiText;
  image: string | null;
  year: number | null;
  age: number | null;
  page_count: number | null;
  price: number | null;
  is_subscription_only: boolean | null;
  authors: RawAuthorRef[] | null;
}

interface RawBookDetail extends RawBookListItem {
  read_count: number | null;
  sold_count: number | null;
  genres: { id: number; name: ApiText }[] | null;
  bookFiles:
    | {
        id: number;
        file_key: string | null;
        file_format: string | null;
        file_size: number | null;
      }[]
    | null;
}

const KNOWN_FORMATS: BookFormat[] = ["EPUB", "PDF", "MOBI", "CBZ"];

function mapAuthorRef(a: RawAuthorRef, lang: Lang): ApiAuthorRef {
  return {
    id: a.id,
    name: localizedText(a.name, lang),
    image: resolveMediaUrl(a.image),
  };
}

function mapBookSummary(b: RawBookSummary, lang: Lang): ApiBookSummary {
  return {
    id: b.id,
    name: localizedText(b.name, lang),
    image: resolveMediaUrl(b.image),
    year: b.year,
    age: b.age,
    authors: (b.authors ?? []).map((a) => mapAuthorRef(a, lang)),
  };
}

export async function getHomeBanners(): Promise<ApiBanner[]> {
  const data = await apiFetch<RawBanner[]>("/banners");
  return (data ?? []).map((b) => ({
    id: b.id,
    name: (b.name ?? "").trim(),
    website_image: resolveMediaUrl(b.website_image),
    link: b.link?.trim() || null,
    book_id: b.book_id ?? null,
  }));
}

export async function getHomeCollections(lang: Lang): Promise<ApiCollection[]> {
  const data = await apiFetch<RawCollection[]>("/collections/all", lang);
  return (data ?? [])
    .map((c): ApiCollection => {
      const type = c.type === "author" ? "author" : "book";
      return {
        id: c.id,
        queue_position: c.queue_position ?? 0,
        type,
        // Unknown/missing card_type must fall back to card_1, never crash.
        card_type: KNOWN_CARD_TYPES.includes(c.card_type as CollectionCardType)
          ? (c.card_type as CollectionCardType)
          : "card_1",
        name: localizedText(c.name, lang),
        sub_title: localizedText(c.sub_title, lang) || null,
        image: resolveMediaUrl(c.image),
        books:
          type === "author"
            ? []
            : (c.books ?? []).map((b) => mapBookSummary(b, lang)),
        authors:
          type === "author"
            ? (c.authors ?? []).map((a) => mapAuthorRef(a, lang))
            : [],
      };
    })
    .filter((c) =>
      c.type === "author" ? c.authors.length > 0 : c.books.length > 0,
    );
}

const KNOWN_CARD_TYPES: CollectionCardType[] = [
  "card_1",
  "card_2",
  "card_3",
  "card_4",
];

/**
 * Spec §3: group only CONSECUTIVE collections sharing a queue_position into
 * one run; never re-sort or merge non-adjacent matches.
 */
export function groupByQueuePosition(
  collections: ApiCollection[],
): ApiCollection[][] {
  const runs: ApiCollection[][] = [];
  for (const c of collections) {
    const last = runs[runs.length - 1];
    if (last && last[0].queue_position === c.queue_position) {
      last.push(c);
    } else {
      runs.push([c]);
    }
  }
  return runs;
}

export function mapListItemToBookDto(b: RawBookListItem, lang: Lang): BookDto {
  return {
    id: b.id,
    name: localizedText(b.name, lang),
    description: localizedText(b.description, lang),
    image: resolveMediaUrl(b.image) ?? "",
    age: b.age ?? 0,
    year: b.year ?? 0,
    page_count: b.page_count ?? 0,
    price: b.price ?? 0,
    is_subscription_only: b.is_subscription_only ?? false,
    recomended: false,
    top_of_the_week: false,
    view_count: 0,
    download_count: 0,
    authors: (b.authors ?? []).map((a) => ({
      id: a.id,
      name: localizedText(a.name, lang),
      bio: "",
      image: resolveMediaUrl(a.image),
    })),
    genres: [],
    formats: [],
  };
}

export async function getApiBook(
  id: number,
  lang: Lang,
): Promise<BookDto | null> {
  if (!Number.isFinite(id) || id <= 0) return null;
  const b = await apiFetch<RawBookDetail>(`/books/${id}`, lang);
  if (!b) return null;
  return {
    ...mapListItemToBookDto(b, lang),
    view_count: b.read_count ?? 0,
    download_count: b.sold_count ?? 0,
    genres: (b.genres ?? []).map((g) => ({
      id: g.id,
      name: localizedText(g.name, lang),
    })),
    formats: [
      ...new Set(
        (b.bookFiles ?? [])
          .map((f) => (f.file_format ?? "").toUpperCase())
          .filter((f): f is BookFormat =>
            KNOWN_FORMATS.includes(f as BookFormat),
          ),
      ),
    ],
    files: (b.bookFiles ?? [])
      .filter((f) => !!f.file_key)
      .map((f) => ({
        id: f.id,
        file_key: f.file_key as string,
        format: (f.file_format ?? "").toUpperCase(),
        size: f.file_size ?? 0,
      })),
  };
}

export async function getBooksByAuthorApi(
  authorId: number,
  lang: Lang,
  excludeBookId?: number,
): Promise<BookDto[]> {
  const data = await apiFetch<{ items: RawBookListItem[] }>(
    `/books/all?page=1&size=12&author_id=${authorId}`,
    lang,
  );
  return (data?.items ?? [])
    .filter((b) => b.id !== excludeBookId)
    .map((b) => mapListItemToBookDto(b, lang));
}

export async function getBooksByGenresApi(
  genreIds: number[],
  lang: Lang,
  excludeBookId?: number,
): Promise<BookDto[]> {
  if (genreIds.length === 0) return [];
  const data = await apiFetch<{ items: RawBookListItem[] }>(
    `/books/all?page=1&size=12&genres=${genreIds.join(",")}`,
    lang,
  );
  return (data?.items ?? [])
    .filter((b) => b.id !== excludeBookId)
    .map((b) => mapListItemToBookDto(b, lang));
}
