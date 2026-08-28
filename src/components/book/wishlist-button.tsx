"use client";

import { Heart } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { usePathname, useRouter } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { ApiError } from "@/lib/api/client";
import { localeToLang } from "@/lib/i18n-lang";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useHydrated } from "@/lib/stores/use-hydrated";
import { useWishlistStore } from "@/lib/stores/wishlist-store";
import type { BookSnapshot } from "@/lib/types";
import { cn } from "@/lib/utils";

export function WishlistButton({
  book,
  className,
}: {
  book: BookSnapshot;
  className?: string;
}) {
  const t = useTranslations();
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const hydrated = useHydrated();

  const token = useAuthStore((s) => s.accessToken);
  const forceLogout = useAuthStore((s) => s.forceLogout);
  const toggle = useWishlistStore((s) => s.toggle);
  const active = useWishlistStore((s) =>
    s.items.some((i) => i.book.id === book.id),
  );
  const isActive = hydrated && active;

  function goLogin() {
    toast.error(t("auth.loginRequired"));
    router.push(`/login?next=${encodeURIComponent(pathname)}`);
  }

  async function handleClick() {
    if (!token) {
      goLogin();
      return;
    }
    try {
      const liked = await toggle(book, token);
      toast.success(
        liked ? t("book.addedToWishlist") : t("book.removedFromWishlist"),
      );
      // In case the list was never hydrated (e.g. first action right after
      // login), make sure the rest of the wishlist is present too.
      void useWishlistStore
        .getState()
        .ensureLoaded(token, localeToLang[locale])
        .catch(() => {});
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        forceLogout();
        goLogin();
      } else {
        toast.error(t("auth.networkError"));
      }
    }
  }

  return (
    <button
      type="button"
      aria-label={t("book.addedToWishlist")}
      aria-pressed={isActive}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void handleClick();
      }}
      className={cn(
        "flex items-center justify-center rounded-full bg-card/95 shadow-sm ring-1 ring-black/5 backdrop-blur transition-all hover:scale-110 active:scale-95",
        isActive ? "text-primary" : "text-muted-foreground",
        className,
      )}
    >
      <Heart className={cn("size-[52%]", isActive && "fill-current")} />
    </button>
  );
}
