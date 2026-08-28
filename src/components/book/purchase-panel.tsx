"use client";

import { useState } from "react";
import { Loader2, Share2, ShoppingBag, Smartphone, Wallet } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { DownloadButton } from "@/components/book/download-button";
import { WishlistButton } from "@/components/book/wishlist-button";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { ApiError, buyBook } from "@/lib/api/client";
import { openBookInApp } from "@/lib/app-links";
import { localeToLang } from "@/lib/i18n-lang";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useHydrated } from "@/lib/stores/use-hydrated";
import { useLibraryStore } from "@/lib/stores/library-store";
import type { BookDto } from "@/lib/types";

function ShareButton({ bookName }: { bookName: string }) {
  const t = useTranslations("book");
  return (
    <Button
      variant="outline"
      size="icon"
      className="size-11 shrink-0 rounded-full"
      aria-label={t("linkCopied")}
      onClick={async () => {
        const url = window.location.href;
        if (navigator.share) {
          await navigator.share({ title: bookName, url }).catch(() => {});
        } else {
          await navigator.clipboard.writeText(url);
          toast.success(t("linkCopied"));
        }
      }}
    >
      <Share2 className="size-4.5" />
    </Button>
  );
}

/** Buy confirmation: price, balance before/after, top-up CTA when short. */
function BuyDialog({
  book,
  open,
  onOpenChange,
}: {
  book: BookDto;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations();
  const locale = useLocale() as Locale;
  const token = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const forceLogout = useAuthStore((s) => s.forceLogout);
  const markBought = useLibraryStore((s) => s.markBought);
  const reloadLibrary = useLibraryStore((s) => s.reload);
  const [busy, setBusy] = useState(false);

  const balance = user?.balance ?? 0;
  const enough = balance >= book?.price;
  const after = balance - book?.price;

  async function confirm() {
    if (!token || busy) return;
    setBusy(true);
    try {
      const res = await buyBook(token, book?.id);
      if (user) setUser({ ...user, balance: res.balance });
      markBought(book);
      void reloadLibrary(token, localeToLang[locale]).catch(() => {});
      toast.success(t("purchase.success"));
      onOpenChange(false);
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        forceLogout();
      } else if (
        e instanceof ApiError &&
        e.message.toLowerCase().includes("insufficient")
      ) {
        toast.error(t("purchase.notEnough"));
      } else {
        toast.error(t("auth.networkError"));
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("purchase.confirmTitle")}</DialogTitle>
        </DialogHeader>

        <div className="rounded-2xl bg-muted/60 p-4">
          <p className="font-semibold">{book?.name}</p>
          {book?.authors?.length > 0 && (
            <p className="mt-0.5 text-sm text-muted-foreground">
              {book?.authors?.map((a) => a?.name).join(", ")}
            </p>
          )}
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">{t("book.price")}</dt>
              <dd className="font-bold">
                {book?.price} {t("common.manat")}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">
                {t("purchase.yourBalance")}
              </dt>
              <dd className="font-semibold">
                {balance} {t("common.manat")}
              </dd>
            </div>
            {enough && (
              <div className="flex items-center justify-between border-t border-border pt-2">
                <dt className="text-muted-foreground">
                  {t("purchase.afterBalance")}
                </dt>
                <dd className="font-semibold text-primary">
                  {after} {t("common.manat")}
                </dd>
              </div>
            )}
          </dl>
        </div>

        {!enough && (
          <p className="rounded-2xl bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
            {t("purchase.notEnoughLong", { amount: book?.price - balance })}
          </p>
        )}

        {enough ? (
          <Button
            size="lg"
            disabled={busy}
            className="w-full rounded-full"
            onClick={() => void confirm()}
          >
            {busy ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <ShoppingBag className="size-4.5" />
            )}
            {t("purchase.confirm")}
          </Button>
        ) : (
          <Button asChild size="lg" className="w-full rounded-full">
            <Link href="/profile/balance">
              <Wallet className="size-4.5" />
              {t("purchase.topUp")}
            </Link>
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function PurchasePanel({
  book,
  variant,
}: {
  book: BookDto;
  variant: "card" | "bar";
}) {
  const t = useTranslations();
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const hydrated = useHydrated();
  const token = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const refreshMe = useAuthStore((s) => s.refreshMe);
  const owned = useLibraryStore((s) => s.items.some((b) => b?.id === book?.id));
  const markBought = useLibraryStore((s) => s.markBought);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [claiming, setClaiming] = useState(false);

  const isOwned = hydrated && owned;
  const isFree = book?.price === 0;

  const snapshot = {
    id: book?.id,
    name: book?.name,
    image: book?.image,
    price: book?.price,
    authors: book?.authors?.map((a) => a?.name).join(", "),
  };

  function goLogin() {
    toast.error(t("auth.loginRequired"));
    router.push(`/login?next=${encodeURIComponent(pathname)}`);
  }

  // Free books are "bought" for 0 so they show up in the user's library.
  async function claimFree() {
    if (!token || claiming) return;
    setClaiming(true);
    try {
      const res = await buyBook(token, book?.id);
      if (user) setUser({ ...user, balance: res.balance });
      markBought(book);
      void useLibraryStore
        .getState()
        .reload(token, localeToLang[locale])
        .catch(() => {});
      toast.success(t("purchase.claimed"));
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) goLogin();
      else toast.error(t("auth.networkError"));
    } finally {
      setClaiming(false);
    }
  }

  const isSubscriptionOnly = !!book?.is_subscription_only;

  const priceEl = isSubscriptionOnly ? (
    <span className="text-xl font-extrabold text-brand-gradient">
      {t("purchase.subscriptionOnly")}
    </span>
  ) : isFree ? (
    <span className="text-2xl font-extrabold text-brand-gradient">
      {t("common.free")}
    </span>
  ) : (
    <span className="text-2xl font-extrabold">
      {book?.price}{" "}
      <span className="text-base font-semibold text-muted-foreground">
        {t("common.manat")}
      </span>
    </span>
  );

  // Subscription-only books can't be bought — the CTA hands the user over to
  // the mobile app (or its store page when the app isn't installed).
  const mainButton = isSubscriptionOnly ? (
    <Button
      size="lg"
      className="h-12 flex-1 rounded-full text-base font-semibold shadow-lg shadow-primary/25"
      onClick={() => openBookInApp(book?.id)}
    >
      <Smartphone className="size-5" />
      {t("purchase.openInApp")}
    </Button>
  ) : isOwned ? (
    <DownloadButton bookId={book?.id} files={book?.files} className="flex-1" />
  ) : (
    <Button
      size="lg"
      disabled={claiming}
      className="h-12 flex-1 rounded-full text-base font-semibold shadow-lg shadow-primary/25"
      onClick={() => {
        if (!token) {
          goLogin();
          return;
        }
        if (isFree) {
          void claimFree();
          return;
        }
        // The cached balance can be stale (other device, other tab).
        void refreshMe();
        setDialogOpen(true);
      }}
    >
      {claiming ? (
        <Loader2 className="size-5 animate-spin" />
      ) : (
        <ShoppingBag className="size-5" />
      )}
      {isFree ? t("purchase.getFree") : t("book.buy")}
    </Button>
  );

  const dialog = (
    <BuyDialog book={book} open={dialogOpen} onOpenChange={setDialogOpen} />
  );

  if (variant === "bar") {
    return (
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur-md lg:hidden">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
          <div className="shrink-0">
            <div className="text-xs text-muted-foreground">
              {t("book.price")}
            </div>
            {priceEl}
          </div>
          {mainButton}
        </div>
        {dialog}
      </div>
    );
  }

  return (
    <div className="rounded-3xl bg-card p-6 shadow-xs ring-1 ring-black/3">
      <div className="text-sm text-muted-foreground">{t("book.price")}</div>
      <div className="mt-1">{priceEl}</div>
      {isSubscriptionOnly && (
        <p className="mt-2 text-sm text-muted-foreground">
          {t("purchase.subscriptionNote")}
        </p>
      )}
      {!isSubscriptionOnly && isOwned && (
        <p className="mt-2 text-sm font-semibold text-emerald-600">
          {t("library.owned")}
        </p>
      )}
      <div className="mt-5 flex items-center gap-2.5">
        {mainButton}
        <WishlistButton
          book={snapshot}
          className="size-11 shrink-0 border border-border bg-card shadow-none ring-0"
        />
        <ShareButton bookName={book?.name} />
      </div>
      {dialog}
    </div>
  );
}
