"use client";

import { useCallback, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ChevronDown, RotateCcw } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { usePathname, useRouter } from "@/i18n/navigation";
import { YEAR_MAX, YEAR_MIN, type FilterOption } from "@/lib/api/catalog";
import { cn } from "@/lib/utils";

const GENRE_LIMIT = 12;

function toggleInList(p: URLSearchParams, key: string, value: string) {
  const list = (p.get(key) ?? "").split(",").filter(Boolean);
  const next = list.includes(value)
    ? list.filter((x) => x !== value)
    : [...list, value];
  if (next.length) p.set(key, next.join(","));
  else p.delete(key);
}

// App-style collapsible filter group: title on the left, current selection
// summary + chevron on the right.
function FilterSection({
  title,
  summary,
  defaultOpen,
  children,
}: {
  title: string;
  summary: string;
  defaultOpen: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 py-0.5 text-left"
      >
        <span className="font-semibold">{title}</span>
        <span className="flex min-w-0 items-center gap-1.5 text-sm text-muted-foreground">
          <span className="max-w-36 truncate">{summary}</span>
          <ChevronDown
            className={cn(
              "size-4 shrink-0 transition-transform duration-200",
              open && "rotate-180",
            )}
          />
        </span>
      </button>
      {open && <div className="mt-3.5">{children}</div>}
    </div>
  );
}

export function FilterPanel({
  genres,
  languages,
  onApply,
}: {
  genres: FilterOption[];
  languages: FilterOption[];
  onApply?: () => void;
}) {
  const t = useTranslations("catalog");
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const yearFrom = Number(sp.get("yearFrom") ?? YEAR_MIN);
  const yearTo = Number(sp.get("yearTo") ?? YEAR_MAX);
  const [years, setYears] = useState<[number, number]>([yearFrom, yearTo]);
  const [prevYears, setPrevYears] = useState<[number, number]>([
    yearFrom,
    yearTo,
  ]);
  if (prevYears[0] !== yearFrom || prevYears[1] !== yearTo) {
    setPrevYears([yearFrom, yearTo]);
    setYears([yearFrom, yearTo]);
  }

  const [showAllGenres, setShowAllGenres] = useState(false);

  const update = useCallback(
    (mutate: (p: URLSearchParams) => void) => {
      const p = new URLSearchParams(sp.toString());
      mutate(p);
      // Any filter change returns to the first page.
      p.delete("page");
      const q = p.toString();
      router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false });
    },
    [sp, router, pathname],
  );

  const genreIds = (sp.get("genres") ?? "").split(",").filter(Boolean);
  const langId = sp.get("langId") ?? "";

  const chips = [
    {
      key: "recomended",
      label: t("chipRecomended"),
      active: sp.get("recomended") === "1",
      toggle: (p: URLSearchParams) =>
        p.get("recomended") ? p.delete("recomended") : p.set("recomended", "1"),
    },
    {
      key: "top",
      label: t("chipTop"),
      active: sp.get("top") === "1",
      toggle: (p: URLSearchParams) =>
        p.get("top") ? p.delete("top") : p.set("top", "1"),
    },
  ];

  const selectedLang = languages.find((l) => String(l.id) === langId);
  // Selected genres first so they stay visible while the list is trimmed.
  const orderedGenres = [
    ...genres.filter((g) => genreIds.includes(String(g.id))),
    ...genres.filter((g) => !genreIds.includes(String(g.id))),
  ];
  const visibleGenres = showAllGenres
    ? orderedGenres
    : orderedGenres.slice(0, GENRE_LIMIT);
  const hiddenGenreCount = orderedGenres.length - GENRE_LIMIT;

  return (
    <div className="space-y-5">
      <div>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {t("quickFilters")}
        </h3>
        <div className="flex flex-wrap gap-2">
          {chips.map((c) => (
            <button
              key={c.key}
              type="button"
              onClick={() => update(c.toggle)}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                c.active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-foreground hover:border-primary/50",
              )}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <Separator />

      <FilterSection
        title={t("language")}
        summary={selectedLang?.name ?? t("any")}
        defaultOpen={Boolean(selectedLang)}
      >
        <RadioGroup
          value={langId}
          onValueChange={(v) =>
            update((p) => {
              if (v) p.set("langId", v);
              else p.delete("langId");
            })
          }
          className="no-scrollbar max-h-56 gap-2.5 overflow-y-auto pr-1"
        >
          <Label className="flex cursor-pointer items-center gap-2.5 font-normal">
            <RadioGroupItem value="" />
            {t("any")}
          </Label>
          {languages.map((l) => (
            <Label
              key={l.id}
              className="flex cursor-pointer items-center gap-2.5 font-normal"
            >
              <RadioGroupItem value={String(l.id)} />
              {l.name}
            </Label>
          ))}
        </RadioGroup>
      </FilterSection>

      {genres.length > 0 && (
        <>
          <Separator />
          <FilterSection
            title={t("genres")}
            summary={genreIds.length > 0 ? String(genreIds.length) : t("any")}
            defaultOpen={genreIds.length > 0}
          >
            <div className="flex flex-wrap gap-2">
              {visibleGenres.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() =>
                    update((p) => toggleInList(p, "genres", String(g.id)))
                  }
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                    genreIds.includes(String(g.id))
                      ? "border-primary bg-secondary text-secondary-foreground"
                      : "border-border bg-card hover:border-primary/50",
                  )}
                >
                  {g.name}
                </button>
              ))}
              {hiddenGenreCount > 0 && (
                <button
                  type="button"
                  onClick={() => setShowAllGenres((v) => !v)}
                  className="rounded-full border border-dashed border-primary/50 px-3 py-1.5 text-sm font-semibold text-primary transition-colors hover:bg-secondary"
                >
                  {showAllGenres
                    ? t("showLess")
                    : t("moreCount", { count: hiddenGenreCount })}
                </button>
              )}
            </div>
          </FilterSection>
        </>
      )}

      <Separator />

      <FilterSection
        title={t("year")}
        summary={
          yearFrom > YEAR_MIN || yearTo < YEAR_MAX
            ? `${yearFrom} – ${yearTo}`
            : t("any")
        }
        defaultOpen={yearFrom > YEAR_MIN || yearTo < YEAR_MAX}
      >
        <div className="mb-3 text-right text-sm text-muted-foreground">
          {years[0]} – {years[1]}
        </div>
        <Slider
          min={YEAR_MIN}
          max={YEAR_MAX}
          step={1}
          value={years}
          onValueChange={(v) => setYears(v as [number, number])}
          onValueCommit={(v) =>
            update((p) => {
              const [from, to] = v as [number, number];
              if (from > YEAR_MIN) p.set("yearFrom", String(from));
              else p.delete("yearFrom");
              if (to < YEAR_MAX) p.set("yearTo", String(to));
              else p.delete("yearTo");
            })
          }
        />
        <div className="mt-2 flex justify-between text-xs text-muted-foreground">
          <span>{YEAR_MIN}</span>
          <span>{YEAR_MAX}</span>
        </div>
      </FilterSection>

      <Separator />

      <Button
        variant="outline"
        className="w-full rounded-xl"
        onClick={() => {
          setYears([YEAR_MIN, YEAR_MAX]);
          router.replace(pathname, { scroll: false });
        }}
      >
        <RotateCcw className="size-4" />
        {t("clear")}
      </Button>

      {onApply && (
        <Button className="w-full rounded-xl" size="lg" onClick={onApply}>
          {t("showResults")}
        </Button>
      )}
    </div>
  );
}
