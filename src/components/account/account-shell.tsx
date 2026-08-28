"use client";

import { useEffect, type ReactNode } from "react";
import {
  BookPlus,
  Heart,
  LibraryBig,
  LifeBuoy,
  LogOut,
  UserRound,
  Wallet,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { UserAvatar } from "@/components/account/user-avatar";
import { Button } from "@/components/ui/button";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { formatPhone } from "@/lib/format";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useHydrated } from "@/lib/stores/use-hydrated";
import { useLibraryStore } from "@/lib/stores/library-store";
import { useWishlistStore } from "@/lib/stores/wishlist-store";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/profile", labelKey: "account.profile", icon: UserRound },
  { href: "/profile/books", labelKey: "account.myBooks", icon: LibraryBig },
  { href: "/wishlist", labelKey: "account.wishlist", icon: Heart },
  { href: "/profile/balance", labelKey: "account.balance", icon: Wallet },
  { href: "/profile/requests", labelKey: "account.requests", icon: BookPlus },
  { href: "/profile/support", labelKey: "account.support", icon: LifeBuoy },
] as const;

function useCounts() {
  const books = useLibraryStore((s) => s.items.length);
  const wishlist = useWishlistStore((s) => s.items.length);
  return { "/profile/books": books, "/wishlist": wishlist } as Record<
    string,
    number | undefined
  >;
}

function UserCard() {
  const t = useTranslations();
  const user = useAuthStore((s) => s.user);
  if (!user) return null;
  const name = user.username || user.phone.replace(/^\+993/, "");

  return (
    <div className="flex items-center gap-3 px-2 pb-4">
      <UserAvatar
        src={user.image}
        name={name}
        sizes="44px"
        className="size-11 text-sm"
      />
      <div className="min-w-0">
        <p className="truncate text-sm font-bold">
          {user.username || `+993 ${formatPhone(user.phone.replace(/^\+993/, ""))}`}
        </p>
        <p className="mt-0.5 text-xs font-semibold text-primary">
          {user.balance} {t("common.manat")}
        </p>
      </div>
    </div>
  );
}

export function AccountShell({ children }: { children: ReactNode }) {
  const t = useTranslations();
  const pathname = usePathname();
  const router = useRouter();
  const hydrated = useHydrated();
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.accessToken);
  const logout = useAuthStore((s) => s.logout);
  const refreshMe = useAuthStore((s) => s.refreshMe);
  const counts = useCounts();
  const active = NAV.find((n) => n.href === pathname) ?? NAV[0];

  // Balance/username can change server-side (purchases, promo codes).
  useEffect(() => {
    if (hydrated && token) void refreshMe();
  }, [hydrated, token, refreshMe]);

  if (!hydrated) {
    return <div className="mx-auto min-h-[60vh] max-w-7xl px-4 py-8" />;
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-sm flex-col items-center gap-5 rounded-3xl bg-card px-6 py-16 text-center shadow-xs ring-1 ring-black/3">
          <span className="flex size-16 items-center justify-center rounded-full bg-brand-gradient-soft">
            <UserRound className="size-7 text-primary" />
          </span>
          <p className="text-muted-foreground">{t("auth.loginRequired")}</p>
          <Button asChild size="lg" className="rounded-full px-8">
            <Link href={`/login?next=${encodeURIComponent(pathname)}`}>
              {t("nav.login")}
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="lg:grid lg:grid-cols-[260px_1fr] lg:items-start lg:gap-8">
        {/* Desktop sidebar */}
        <aside className="hidden lg:sticky lg:top-24 lg:block">
          <div className="rounded-3xl bg-card p-3 shadow-xs ring-1 ring-black/3">
            <UserCard />
            <nav className="space-y-1">
              {NAV.map(({ href, labelKey, icon: Icon }) => {
                const isActive = href === active.href;
                const count = counts[href];
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition-colors",
                      isActive
                        ? "bg-brand-gradient-soft text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <Icon className="size-4.5 shrink-0" />
                    <span className="truncate">{t(labelKey)}</span>
                    {!!count && (
                      <span
                        className={cn(
                          "ml-auto rounded-full px-2 py-0.5 text-[11px] font-bold",
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground",
                        )}
                      >
                        {count}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
            <div className="mt-2 border-t border-border pt-2">
              <button
                type="button"
                onClick={() => {
                  logout();
                  router.push("/");
                }}
                className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
              >
                <LogOut className="size-4.5" />
                {t("profile.logout")}
              </button>
            </div>
          </div>
        </aside>

        {/* Mobile: user row + scrollable chips */}
        <div className="lg:hidden">
          <div className="rounded-3xl bg-card px-3 py-3 shadow-xs ring-1 ring-black/3">
            <UserCard />
          </div>
          <div className="no-scrollbar -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1">
            {NAV.map(({ href, labelKey, icon: Icon }) => {
              const isActive = href === active.href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                    isActive
                      ? "bg-brand-gradient text-white shadow-sm shadow-primary/25"
                      : "bg-card text-muted-foreground ring-1 ring-black/5",
                  )}
                >
                  <Icon className="size-4" />
                  {t(labelKey)}
                </Link>
              );
            })}
          </div>
        </div>

        <main className="mt-8 min-w-0 lg:mt-0">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                {t(active.labelKey)}
              </h1>
              <span className="mt-2 block h-[3px] w-9 rounded-full bg-brand-gradient" />
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full text-muted-foreground lg:hidden"
              onClick={() => {
                logout();
                router.push("/");
              }}
            >
              <LogOut className="size-4" />
              {t("profile.logout")}
            </Button>
          </div>
          <div className="mt-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
