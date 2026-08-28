"use client";

import { useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { BookCard } from "@/components/book/book-card";
import { EmptyState } from "@/components/catalog/empty-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { localeToLang } from "@/lib/i18n-lang";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useWishlistStore } from "@/lib/stores/wishlist-store";

// Guest handling lives in the account shell; here the user is always present.
export function WishlistSection() {
  const t = useTranslations();
  const locale = useLocale() as Locale;
  const token = useAuthStore((s) => s.accessToken);
  const { items, loaded, loading, ensureLoaded } = useWishlistStore();

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
            <Skeleton className="h-3.5 w-1/2 rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        title={t("wishlist.empty")}
        description={t("wishlist.emptyDesc")}
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
      {items.map((i) => (
        <BookCard key={i.book.id} book={i.book} />
      ))}
    </div>
  );
}
