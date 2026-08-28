"use client";

import { useEffect } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { DownloadButton } from "@/components/book/download-button";
import { EmptyState } from "@/components/catalog/empty-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { localeToLang } from "@/lib/i18n-lang";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useLibraryStore } from "@/lib/stores/library-store";
import type { BookDto } from "@/lib/types";

function LibraryCard({ book }: { book: BookDto }) {
  const byline = book.authors.map((a) => a.name).join(", ");
  return (
    <div className="group flex flex-col">
      <Link href={`/books/${book.id}`} className="block">
        <div className="relative aspect-2/3 overflow-hidden rounded-2xl bg-muted shadow-sm ring-1 ring-black/5 transition-shadow duration-300 group-hover:shadow-xl group-hover:shadow-foreground/10">
          {book.image && (
            <Image
              src={book.image}
              alt={book.name}
              fill
              sizes="(max-width: 640px) 45vw, (max-width: 1024px) 28vw, 200px"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            />
          )}
        </div>
        <h3 className="mt-3 line-clamp-1 text-[15px] font-semibold leading-snug">
          {book.name}
        </h3>
        <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">
          {byline}
        </p>
      </Link>
      <DownloadButton
        bookId={book.id}
        size="sm"
        variant="outline"
        className="mt-3 w-full"
      />
    </div>
  );
}

export function LibrarySection() {
  const t = useTranslations();
  const locale = useLocale() as Locale;
  const token = useAuthStore((s) => s.accessToken);
  const { items, loaded, loading, ensureLoaded } = useLibraryStore();

  useEffect(() => {
    if (token) ensureLoaded(token, localeToLang[locale]).catch(() => {});
  }, [token, locale, ensureLoaded]);

  if (!loaded && loading) {
    return (
      <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="aspect-2/3 w-full rounded-2xl" />
            <Skeleton className="h-4 w-3/4 rounded-full" />
            <Skeleton className="h-8 w-full rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        title={t("library.empty")}
        description={t("library.emptyDesc")}
        action={
          <Button asChild className="rounded-full">
            <Link href="/books">{t("library.browse")}</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-5 lg:grid-cols-4">
      {items.map((b) => (
        <LibraryCard key={b.id} book={b} />
      ))}
    </div>
  );
}
