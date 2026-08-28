import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  AUTHOR_PALETTE,
  authorInitials,
} from "@/components/home/author-avatar";
import { ApiBookCard } from "@/components/home/api-book-card";
import { RankedGridCard } from "@/components/book/ranked-book-card";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { getHomeCollections, type ApiAuthorRef } from "@/lib/api/home";
import { localeToLang } from "@/lib/i18n-lang";
import { cn } from "@/lib/utils";

export const revalidate = 120;

type Props = { params: Promise<{ locale: Locale; id: string }> };

// The backend has no usable GET /collections/:id (stub) — the full list
// endpoint already carries every collection's books/authors, pick from it.
async function findCollection(locale: Locale, id: string) {
  const collections = await getHomeCollections(localeToLang[locale]);
  return collections.find((c) => c.id === Number(id)) ?? null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, id } = await params;
  const collection = await findCollection(locale, id);
  return collection ? { title: collection.name } : {};
}

function AuthorTile({ author, index }: { author: ApiAuthorRef; index: number }) {
  return (
    <Link
      href={`/books?author=${author.id}`}
      className="group flex flex-col items-center gap-3 rounded-3xl bg-card p-6 text-center shadow-xs ring-1 ring-black/3 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-foreground/8"
    >
      {author.image ? (
        <span className="relative size-24 overflow-hidden rounded-full shadow-md ring-2 ring-transparent transition-all group-hover:ring-primary/60">
          <Image
            src={author.image}
            alt={author.name}
            fill
            sizes="96px"
            className="object-cover"
          />
        </span>
      ) : (
        <span
          className={cn(
            "flex size-24 items-center justify-center rounded-full text-2xl font-bold text-white shadow-md",
            AUTHOR_PALETTE[index % AUTHOR_PALETTE.length],
          )}
        >
          {authorInitials(author.name)}
        </span>
      )}
      <span className="line-clamp-2 font-semibold leading-snug">
        {author.name}
      </span>
    </Link>
  );
}

export default async function CollectionPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const collection = await findCollection(locale, id);
  if (!collection) notFound();

  const t = await getTranslations("common");
  const count =
    collection.type === "author"
      ? collection.authors.length
      : collection.books.length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
        {collection.name}
      </h1>
      <span className="mt-2 block h-[3px] w-9 rounded-full bg-brand-gradient" />
      <p className="mt-2 text-sm text-muted-foreground">
        {collection.sub_title ? `${collection.sub_title} · ` : ""}
        {t("booksCount", { count })}
      </p>

      {collection.type === "author" ? (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-5">
          {collection.authors.map((a, i) => (
            <AuthorTile key={a.id} author={a} index={i} />
          ))}
        </div>
      ) : collection.card_type === "card_2" ||
        collection.card_type === "card_4" ? (
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-5 lg:grid-cols-4 xl:grid-cols-5">
          {collection.books.map((b, i) => (
            <RankedGridCard key={b.id} book={b} rank={i + 1} />
          ))}
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-5 lg:grid-cols-4 xl:grid-cols-5">
          {collection.books.map((b) => (
            <ApiBookCard key={b.id} book={b} />
          ))}
        </div>
      )}
    </div>
  );
}
