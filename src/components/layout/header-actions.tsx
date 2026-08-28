"use client";

import { useEffect } from "react";
import { Heart, User } from "lucide-react";
import { useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { localeToLang } from "@/lib/i18n-lang";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useHydrated } from "@/lib/stores/use-hydrated";
import { useLibraryStore } from "@/lib/stores/library-store";
import { useWishlistStore } from "@/lib/stores/wishlist-store";

function CountBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="absolute -right-0.5 -top-0.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold leading-none text-primary-foreground">
      {count > 9 ? "9+" : count}
    </span>
  );
}

export function HeaderActions({
  labels,
}: {
  labels: { wishlist: string; profile: string };
}) {
  const locale = useLocale() as Locale;
  const hydrated = useHydrated();
  const token = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);
  const wishlistCount = useWishlistStore((s) => s.items.length);
  const ensureWishlist = useWishlistStore((s) => s.ensureLoaded);
  const ensureLibrary = useLibraryStore((s) => s.ensureLoaded);

  // Header is on every page — hydrate the server-backed lists once per session.
  useEffect(() => {
    if (hydrated && token) {
      const lang = localeToLang[locale];
      ensureWishlist(token, lang).catch(() => {});
      ensureLibrary(token, lang).catch(() => {});
    }
  }, [hydrated, token, locale, ensureWishlist, ensureLibrary]);

  return (
    <div className="flex shrink-0 items-center gap-0.5">
      <Button
        asChild
        variant="ghost"
        size="icon"
        className="relative size-10 rounded-full"
      >
        <Link href="/wishlist" aria-label={labels.wishlist}>
          <Heart className="size-5" />
          <CountBadge count={hydrated && token ? wishlistCount : 0} />
        </Link>
      </Button>
      <Button
        asChild
        variant="ghost"
        size="icon"
        className="size-10 rounded-full"
      >
        <Link
          href={hydrated && user ? "/profile" : "/login"}
          aria-label={labels.profile}
        >
          <User className="size-5" />
        </Link>
      </Button>
    </div>
  );
}
