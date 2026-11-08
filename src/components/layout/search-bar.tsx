"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Search } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { searchBooksLive } from "@/lib/api/client";
import { localeToLang } from "@/lib/i18n-lang";
import type { BookDto } from "@/lib/types";
import { cn } from "@/lib/utils";

const MIN_QUERY = 2;
const DEBOUNCE_MS = 300;

export function SearchBar({
  placeholder,
  className,
}: {
  placeholder: string;
  className?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale() as Locale;
  const lang = localeToLang[locale];
  const t = useTranslations("common");

  const [q, setQ] = useState("");
  const [results, setResults] = useState<BookDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const seqRef = useRef(0);

  useEffect(() => {
    const query = q.trim();
    if (query.length < MIN_QUERY) {
      seqRef.current++;
      return;
    }
    const seq = ++seqRef.current;
    const timer = setTimeout(async () => {
      // Fail-soft: a dead network just shows the empty state.
      const items = await searchBooksLive(query, lang).catch(() => []);
      if (seqRef.current !== seq) return; // stale response
      setResults(items);
      setLoading(false);
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [q, lang]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (formRef.current && !formRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  return (
    <form
      ref={formRef}
      role="search"
      className={cn("relative", className)}
      onSubmit={(e) => {
        e.preventDefault();
        const s = q.trim();
        setOpen(false);
        // Closing the keyboard here means mobile users never press Back to
        // dismiss it (which could fall through to a history navigation).
        inputRef.current?.blur();
        const target = s ? `/books?search=${encodeURIComponent(s)}` : "/books";
        // Re-searching from the results page replaces the entry so repeated
        // queries don't pile up in history.
        const alreadyOnResults =
          pathname === "/books" &&
          new URLSearchParams(window.location.search).has("search");
        if (alreadyOnResults) router.replace(target);
        else router.push(target);
      }}
    >
      <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        ref={inputRef}
        type="search"
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
        value={q}
        onChange={(e) => {
          const value = e.target.value;
          const hasQuery = value.trim().length >= MIN_QUERY;
          seqRef.current++;
          setQ(value);
          setResults([]);
          setLoading(hasQuery);
          setOpen(hasQuery);
        }}
        onFocus={() => {
          if (q.trim().length >= MIN_QUERY) setOpen(true);
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            setOpen(false);
            inputRef.current?.blur();
          }
        }}
        placeholder={placeholder}
        className="h-10 rounded-full border-transparent bg-muted/70 pl-10 text-sm shadow-none transition-colors focus-visible:bg-card"
      />

      {open && (
        <div
          role="listbox"
          className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border bg-card shadow-lg"
        >
          {loading ? (
            <p className="px-4 py-3 text-sm text-muted-foreground">
              {t("loading")}
            </p>
          ) : results.length ? (
            <>
              <ul className="max-h-96 overflow-y-auto py-1">
                {results.map((b) => (
                  <li key={b.id}>
                    <Link
                      href={`/books/${b.id}`}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 transition-colors hover:bg-muted/60"
                    >
                      <span className="relative h-14 w-10 shrink-0 overflow-hidden rounded-md bg-muted">
                        {b.image && (
                          <Image
                            src={b.image}
                            alt={b.name}
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        )}
                      </span>
                      <span className="min-w-0">
                        <span className="line-clamp-1 block text-sm font-semibold">
                          {b.name}
                        </span>
                        <span className="line-clamp-1 block text-xs text-muted-foreground">
                          {b.authors.map((a) => a.name).join(", ")}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              <button
                type="submit"
                className="block w-full border-t px-4 py-2.5 text-center text-sm font-semibold text-primary transition-colors hover:bg-muted/60"
              >
                {t("seeAll")}
              </button>
            </>
          ) : (
            <p className="px-4 py-3 text-sm text-muted-foreground">
              {t("searchNoResults")}
            </p>
          )}
        </div>
      )}
    </form>
  );
}
