import type { Metadata } from "next";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { BookCard } from "@/components/book/book-card";
import { EmptyState } from "@/components/catalog/empty-state";
import { FilterPanel } from "@/components/catalog/filter-panel";
import { FilterSheet } from "@/components/catalog/filter-sheet";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import {
  getAuthorApi,
  getBookLanguagesApi,
  getCatalogBooks,
  getGenresApi,
  PAGE_SIZE,
} from "@/lib/api/catalog";
import { localeToLang } from "@/lib/i18n-lang";

type SearchParams = Record<string, string | string[] | undefined>;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "catalog" });
  return { title: t("title") };
}

function pageHref(sp: SearchParams, page: number): string {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    if (typeof v === "string" && v) p.set(k, v);
  }
  if (page > 1) p.set("page", String(page));
  else p.delete("page");
  const q = p.toString();
  return q ? `/books?${q}` : "/books";
}

export default async function BooksPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<SearchParams>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;
  const lang = localeToLang[locale];
  const t = await getTranslations("catalog");

  const str = (k: string) => (typeof sp[k] === "string" ? sp[k] : undefined);
  const num = (k: string) => {
    const v = Number(str(k));
    return Number.isFinite(v) && v > 0 ? v : undefined;
  };

  const authorId = num("author");
  const page = num("page") ?? 1;

  const [result, genres, languages, author] = await Promise.all([
    getCatalogBooks(
      {
        page,
        search: str("search"),
        genreIds: (str("genres") ?? "")
          .split(",")
          .map(Number)
          .filter((n) => Number.isFinite(n) && n > 0),
        authorId,
        languageId: num("langId"),
        yearFrom: num("yearFrom"),
        yearTo: num("yearTo"),
        recomended: str("recomended") === "1",
        top: str("top") === "1",
      },
      lang,
    ),
    getGenresApi(lang),
    getBookLanguagesApi(lang),
    authorId ? getAuthorApi(authorId, lang) : Promise.resolve(null),
  ]);

  const heading = author?.name || t("title");
  const totalPages = Math.max(1, Math.ceil(result.totalCount / PAGE_SIZE));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {heading}
          </h1>
          <span className="mt-2 block h-[3px] w-9 rounded-full bg-brand-gradient" />
          <p className="mt-2 text-sm text-muted-foreground">
            {t("found", { count: result.totalCount })}
          </p>
        </div>
        <FilterSheet genres={genres} languages={languages} />
      </div>

      <div className="mt-8 lg:grid lg:grid-cols-[290px_1fr] lg:items-start lg:gap-10">
        <aside className="hidden lg:block">
          <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto rounded-3xl bg-card p-6 shadow-xs ring-1 ring-black/3">
            <FilterPanel genres={genres} languages={languages} />
          </div>
        </aside>

        <div className="min-w-0">
          {result.items.length > 0 ? (
            <>
              <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-5 xl:grid-cols-4">
                {result.items.map((b) => (
                  <BookCard key={b.id} book={b} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-10 flex items-center justify-center gap-3">
                  {page > 1 ? (
                    <Button asChild variant="outline" className="rounded-full">
                      <Link href={pageHref(sp, page - 1)}>
                        <ChevronLeft className="size-4" />
                        {t("prev")}
                      </Link>
                    </Button>
                  ) : (
                    <Button variant="outline" className="rounded-full" disabled>
                      <ChevronLeft className="size-4" />
                      {t("prev")}
                    </Button>
                  )}
                  <span className="rounded-full bg-card px-4 py-2 text-sm font-semibold ring-1 ring-border">
                    {page} / {totalPages}
                  </span>
                  {page < totalPages ? (
                    <Button asChild variant="outline" className="rounded-full">
                      <Link href={pageHref(sp, page + 1)}>
                        {t("next")}
                        <ChevronRight className="size-4" />
                      </Link>
                    </Button>
                  ) : (
                    <Button variant="outline" className="rounded-full" disabled>
                      {t("next")}
                      <ChevronRight className="size-4" />
                    </Button>
                  )}
                </div>
              )}
            </>
          ) : (
            <EmptyState
              title={t("empty")}
              description={t("emptyDesc")}
              action={
                <Button asChild variant="outline" className="rounded-full">
                  <Link href="/books">{t("clear")}</Link>
                </Button>
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}
