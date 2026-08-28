import type { Metadata } from "next";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AuthorSearch } from "@/components/catalog/author-search";
import { EmptyState } from "@/components/catalog/empty-state";
import {
  AUTHOR_PALETTE,
  authorInitials,
} from "@/components/home/author-avatar";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { getAuthorsApi } from "@/lib/api/catalog";
import { localeToLang } from "@/lib/i18n-lang";
import { cn } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "authorsPage" });
  return { title: t("title") };
}

export default async function AuthorsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;
  const lang = localeToLang[locale];
  const search = typeof sp.search === "string" ? sp.search : "";

  const [t, tc, authors] = await Promise.all([
    getTranslations("authorsPage"),
    getTranslations("common"),
    getAuthorsApi(lang, search),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {t("title")}
          </h1>
          <span className="mt-2 block h-[3px] w-9 rounded-full bg-brand-gradient" />
          <p className="mt-3 text-muted-foreground">{t("subtitle")}</p>
        </div>
        <AuthorSearch
          placeholder={t("searchPlaceholder")}
          initialValue={search}
        />
      </div>

      <div className="mt-8">
        {authors.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5">
            {authors.map((a, i) => (
              <Link
                key={a.id}
                href={`/books?author=${a.id}`}
                className="group flex flex-col items-center gap-3.5 rounded-3xl bg-card p-6 text-center shadow-xs ring-1 ring-black/3 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-foreground/8"
              >
                {a.image ? (
                  <span className="relative size-24 overflow-hidden rounded-full shadow-md ring-2 ring-transparent transition-all group-hover:ring-primary/60">
                    <Image
                      src={a.image}
                      alt={a.name}
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  </span>
                ) : (
                  <span
                    className={cn(
                      "flex size-24 items-center justify-center rounded-full text-2xl font-bold text-white shadow-md ring-2 ring-transparent transition-all group-hover:ring-primary/60",
                      AUTHOR_PALETTE[i % AUTHOR_PALETTE.length],
                    )}
                  >
                    {authorInitials(a.name)}
                  </span>
                )}
                <span className="min-w-0">
                  <span className="line-clamp-2 block font-semibold leading-snug">
                    {a.name}
                  </span>
                  <span className="mt-1.5 inline-block rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground">
                    {tc("booksCount", { count: a.book_count })}
                  </span>
                </span>
                <span className="mt-auto flex items-center gap-1.5 text-sm font-semibold text-primary transition-transform group-hover:translate-x-0.5">
                  {t("allBooks")}
                  <ArrowRight className="size-4" />
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState title={t("title")} description={t("subtitle")} />
        )}
      </div>
    </div>
  );
}
