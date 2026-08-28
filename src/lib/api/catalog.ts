// Catalog + authors fetchers against the real API. Fail-soft like home.ts.
import { localizedText, pickLang } from "@/lib/i18n-lang";
import type { BookDto, Lang, MultiLang } from "@/lib/types";
import { apiFetch, resolveMediaUrl } from "./http";
import { mapListItemToBookDto, type RawBookListItem } from "./home";

export const YEAR_MIN = 1990;
export const YEAR_MAX = 2026;
export const PAGE_SIZE = 24;

export interface CatalogQuery {
  page?: number;
  size?: number;
  search?: string;
  genreIds?: number[];
  authorId?: number;
  languageId?: number;
  yearFrom?: number;
  yearTo?: number;
  recomended?: boolean;
  top?: boolean;
}

export interface CatalogResult {
  items: BookDto[];
  totalCount: number;
  page: number;
}

export async function getCatalogBooks(
  q: CatalogQuery,
  lang: Lang,
): Promise<CatalogResult> {
  const p = new URLSearchParams();
  p.set("page", String(q.page && q.page > 0 ? q.page : 1));
  p.set("size", String(q.size ?? PAGE_SIZE));
  if (q.search?.trim()) p.set("search", q.search.trim());
  if (q.genreIds?.length) p.set("genres", q.genreIds.join(","));
  if (q.authorId) p.set("author_id", String(q.authorId));
  if (q.languageId) p.set("language_id", String(q.languageId));
  // The backend applies the year range only when BOTH bounds are present.
  if (q.yearFrom !== undefined || q.yearTo !== undefined) {
    p.set("start_year", String(q.yearFrom ?? YEAR_MIN));
    p.set("end_year", String(q.yearTo ?? YEAR_MAX));
  }
  if (q.recomended) p.set("recomended", "true");
  if (q.top) p.set("top_of_the_week", "true");

  const data = await apiFetch<{
    items: RawBookListItem[];
    totalCount: number;
    page: number;
  }>(`/books/all?${p.toString()}`, lang, 60);

  return {
    items: (data?.items ?? []).map((b) => mapListItemToBookDto(b, lang)),
    totalCount: data?.totalCount ?? 0,
    page: data?.page ?? 1,
  };
}

export interface FilterOption {
  id: number;
  name: string;
}

export async function getGenresApi(lang: Lang): Promise<FilterOption[]> {
  const data = await apiFetch<
    { id: number; name: unknown; parent_id: number | null }[]
  >("/genres/all", lang, 300);
  return (data ?? []).map((g) => ({
    id: g.id,
    name: localizedText(g.name, lang),
  }));
}

export async function getBookLanguagesApi(
  lang: Lang,
): Promise<FilterOption[]> {
  // /book-languages returns raw entities with multilang jsonb names —
  // flatten client-side.
  const data = await apiFetch<{ id: number; name: MultiLang | null }[]>(
    "/book-languages",
    undefined,
    300,
  );
  return (data ?? []).map((l) => ({
    id: l.id,
    name: l.name ? pickLang(l.name, lang) : String(l.id),
  }));
}

export interface ApiAuthorListItem {
  id: number;
  name: string;
  image: string | null;
  book_count: number;
}

/** The backend feeds `search` into an unescaped POSIX regex — strip
 * anything that could break it (keep letters, digits, spaces, hyphens). */
function sanitizeAuthorSearch(input: string): string {
  return input.replace(/[^\p{L}\p{N}\s-]/gu, "").trim();
}

export async function getAuthorsApi(
  lang: Lang,
  search = "",
  size = 96,
): Promise<ApiAuthorListItem[]> {
  const p = new URLSearchParams();
  // Empty search matches everything — the only way to list all authors.
  p.set("search", sanitizeAuthorSearch(search));
  p.set("page", "1");
  p.set("size", String(size));

  const data = await apiFetch<
    {
      id: number;
      name: unknown;
      image: string | null;
      book_count: string | number | null;
    }[]
  >(`/authors/search?${p.toString()}`, lang, 60);

  return (data ?? [])
    .map((a) => ({
      id: a.id,
      name: localizedText(a.name, lang),
      image: resolveMediaUrl(a.image),
      book_count: Number(a.book_count ?? 0) || 0,
    }))
    // No ORDER BY server-side — sort here for a stable, friendly list.
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function getAuthorApi(
  id: number,
  lang: Lang,
): Promise<{ id: number; name: string; image: string | null; bio: string } | null> {
  if (!Number.isFinite(id) || id <= 0) return null;
  const data = await apiFetch<{
    id: number;
    name: unknown;
    image: string | null;
    bio: unknown;
  }>(`/authors/${id}`, lang, 120);
  if (!data) return null;
  return {
    id: data.id,
    name: localizedText(data.name, lang),
    image: resolveMediaUrl(data.image),
    bio: localizedText(data.bio, lang),
  };
}
