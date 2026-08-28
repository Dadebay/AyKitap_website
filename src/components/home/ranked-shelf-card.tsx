import Image from "next/image";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import type { ApiCollection } from "@/lib/api/home";
import { cn } from "@/lib/utils";

// card_2 — ranked "chart" shelf: banner strip from the collection's own image
// (first book's cover as fallback), then up to 4 ranked rows, then "See more".
export function RankedShelfCard({
  collection,
  compact,
}: {
  collection: ApiCollection;
  compact?: boolean;
}) {
  const t = useTranslations("common");
  const cover = collection.image ?? collection.books[0]?.image;
  const top = collection.books.slice(0, 4);

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-3xl bg-navy text-white shadow-xl">
      <div className={cn("relative shrink-0", compact ? "h-21" : "h-28 sm:h-32")}>
        {cover && (
          <Image
            src={cover}
            alt=""
            fill
            sizes={compact ? "320px" : "(max-width: 1024px) 100vw, 640px"}
            className="object-cover object-top"
          />
        )}
        <div className="absolute inset-0 bg-linear-to-b from-black/10 via-black/45 to-navy" />
        <div className="absolute inset-x-5 bottom-2.5">
          <h3 className={cn("font-bold", compact ? "line-clamp-1 text-base" : "text-lg sm:text-xl")}>
            {collection.name}
          </h3>
          {collection.sub_title && (
            <p className="line-clamp-1 text-sm text-white/70">
              {collection.sub_title}
            </p>
          )}
        </div>
      </div>

      <ol
        className={cn(
          "flex-1 space-y-0.5 py-2.5",
          compact ? "px-2" : "px-3 sm:px-4",
        )}
      >
        {top.map((b, i) => (
          <li key={b.id}>
            <Link
              href={`/books/${b.id}`}
              className="flex items-center gap-3.5 rounded-2xl p-2 transition-colors hover:bg-white/5"
            >
              <span className="w-6 shrink-0 text-center text-xl font-extrabold text-brand-gradient">
                {i + 1}
              </span>
              <span className="relative h-14 w-10 shrink-0 overflow-hidden rounded-lg bg-white/10">
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
                <span className="line-clamp-1 block text-xs text-white/60">
                  {b.authors.map((a) => a.name).join(", ")}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ol>

      {collection.books.length > 4 && (
        <div className={cn("pb-4", compact ? "px-4" : "px-5 sm:px-6 sm:pb-5")}>
          <Button
            asChild
            variant="outline"
            size={compact ? "sm" : "default"}
            className="w-full rounded-xl border-white/25 bg-transparent text-white hover:bg-white/10 hover:text-white"
          >
            <Link href={`/collections/${collection.id}`}>{t("more")}</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
