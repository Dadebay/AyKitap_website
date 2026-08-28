import { Suspense } from "react";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { HeaderActions } from "./header-actions";
import { LanguageSwitcher } from "./language-switcher";
import { SearchBar } from "./search-bar";

export async function Header() {
  const t = await getTranslations("nav");
  const tc = await getTranslations("common");

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <Image
            src="/logo.png"
            alt="Aýkitap"
            width={38}
            height={38}
            priority
            className="size-[38px] rounded-xl"
          />
          <span className="hidden text-lg font-bold tracking-tight sm:inline">
            Aýkitap
          </span>
        </Link>

        <nav className="ml-2 hidden items-center gap-1 md:flex">
          <Link
            href="/"
            className="rounded-full px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            {t("home")}
          </Link>
          <Link
            href="/books"
            className="rounded-full px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            {t("catalog")}
          </Link>
          <Link
            href="/authors"
            className="rounded-full px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            {t("authors")}
          </Link>
        </nav>

        <div className="ml-auto flex min-w-0 flex-1 items-center justify-end gap-2">
          <SearchBar
            placeholder={tc("search")}
            className="hidden w-full max-w-xs md:block"
          />
          <Suspense fallback={<div className="h-10 w-14" />}>
            <LanguageSwitcher />
          </Suspense>
          <HeaderActions
            labels={{
              wishlist: t("wishlist"),
              profile: t("profile"),
            }}
          />
        </div>
      </div>

      <div className="border-t border-border/50 px-4 py-2.5 md:hidden">
        <SearchBar placeholder={tc("search")} />
      </div>
    </header>
  );
}
