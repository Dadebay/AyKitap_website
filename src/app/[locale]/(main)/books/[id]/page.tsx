import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { FileText } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { BookCard } from "@/components/book/book-card";
import { ExpandableText } from "@/components/book/expandable-text";
import { PurchasePanel } from "@/components/book/purchase-panel";
import { RowCarousel } from "@/components/book/row-carousel";
import { SectionHeader } from "@/components/book/section-header";
import { StatsRow } from "@/components/book/stats-row";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import {
  getApiBook,
  getBooksByAuthorApi,
  getBooksByGenresApi,
} from "@/lib/api/home";
import { localeToLang } from "@/lib/i18n-lang";

export const revalidate = 120;

type Props = {
  params: Promise<{ locale: Locale; id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, id } = await params;
  const book = await getApiBook(Number(id), localeToLang[locale]);
  if (!book) return {};
  return {
    title: book?.name,
    description: book?.description.slice(0, 160),
  };
}

export default async function BookDetailPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const lang = localeToLang[locale];

  const book = await getApiBook(Number(id), lang);
  if (!book) notFound();

  const t = await getTranslations("book");
  const mainAuthor = book?.authors?.[0];
  const [similar, byAuthor] = await Promise.all([
    getBooksByGenresApi(
      book?.genres.map((g) => g?.id),
      lang,
      book?.id,
    ),
    mainAuthor
      ? getBooksByAuthorApi(mainAuthor?.id, lang, book?.id)
      : Promise.resolve([]),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 pb-28 sm:px-6 lg:px-8 lg:pb-8">
      <div className="lg:grid lg:grid-cols-[320px_1fr] lg:items-start lg:gap-12">
        <div className="lg:sticky lg:top-24 lg:space-y-6">
          <div className="relative mx-auto aspect-2/3 w-52 overflow-hidden rounded-2xl bg-muted shadow-xl shadow-foreground/15 sm:w-60 lg:w-full">
            {book?.image && (
              <Image
                src={book?.image}
                alt={book?.name}
                fill
                priority
                sizes="(max-width: 1024px) 240px, 320px"
                className="object-cover"
              />
            )}
          </div>
          <div className="hidden lg:block">
            <PurchasePanel book={book} variant="card" />
          </div>
        </div>

        {/* min-w-0: grid items default to min-width:auto, so the carousels
            would stretch this column past the page container. */}
        <div className="mt-8 min-w-0 space-y-8 lg:mt-0">
          <div className="space-y-4 text-center sm:text-left">
            <h1 className="text-2xl font-bold leading-tight tracking-tight sm:text-3xl lg:text-4xl">
              {book?.name}
            </h1>
            {mainAuthor && (
              <Link
                href={`/books?author=${mainAuthor.id}`}
                className="inline-flex items-center gap-1 font-semibold text-primary transition-colors hover:text-primary/80"
              >
                {book?.authors?.map((a) => a.name).join(", ")}
                <span aria-hidden>›</span>
              </Link>
            )}
            <StatsRow book={book} />
            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              {book?.formats?.map((f) => (
                <Badge
                  key={f}
                  variant="outline"
                  className="gap-1.5 rounded-full border-border bg-card px-3 py-1.5 text-xs font-semibold"
                >
                  <FileText className="size-3.5 text-primary" />
                  {f}
                </Badge>
              ))}
              {book?.age > 0 && (
                <Badge
                  variant="outline"
                  className="rounded-full border-border bg-card px-3 py-1.5 text-xs font-semibold"
                >
                  {book?.age}+
                </Badge>
              )}
              {book?.year > 0 && (
                <Badge
                  variant="outline"
                  className="rounded-full border-border bg-card px-3 py-1.5 text-xs font-semibold"
                >
                  {book?.year}
                </Badge>
              )}
            </div>
          </div>

          <div className="lg:hidden">
            <PurchasePanel book={book} variant="card" />
          </div>

          {book?.description && (
            <section>
              <h2 className="mb-3 text-lg font-bold sm:text-xl">
                {t("about")}
              </h2>
              <ExpandableText text={book?.description} />
            </section>
          )}

          {book?.genres?.length > 0 && (
            <section>
              <h2 className="mb-3 text-lg font-bold sm:text-xl">
                {t("genres")}
              </h2>
              <div className="flex flex-wrap gap-2">
                {book?.genres?.map((g) => (
                  <Link
                    key={g.id}
                    href={`/books?genres=${g.id}`}
                    className="rounded-full border border-primary/30 bg-secondary px-4 py-1.5 text-sm font-medium text-secondary-foreground transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground"
                  >
                    {g.name}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {similar.length > 0 && (
            <section>
              <SectionHeader title={t("similar")} />
              <RowCarousel itemClassName="basis-[44%] sm:basis-[30%] md:basis-[26%] lg:basis-[22%]">
                {similar.map((b) => (
                  <BookCard key={b.id} book={b} />
                ))}
              </RowCarousel>
            </section>
          )}

          {byAuthor.length > 0 && (
            <section>
              <SectionHeader title={t("byAuthor")} />
              <RowCarousel itemClassName="basis-[44%] sm:basis-[30%] md:basis-[26%] lg:basis-[22%]">
                {byAuthor.map((b) => (
                  <BookCard key={b.id} book={b} />
                ))}
              </RowCarousel>
            </section>
          )}
        </div>
      </div>

      <PurchasePanel book={book} variant="bar" />
    </div>
  );
}
