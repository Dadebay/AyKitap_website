import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { ApiCollection } from "@/lib/api/home";
import { cn } from "@/lib/utils";

// card_3 — big hero image card (collection image, first book's cover as
// fallback) with a frosted-glass bottom panel carrying name and book count.
export function CollectionHeroCard({
  collection,
  compact,
}: {
  collection: ApiCollection;
  compact?: boolean;
}) {
  const t = useTranslations("common");
  const cover = collection.image ?? collection.books[0]?.image;

  return (
    <Link
      href={`/collections/${collection.id}`}
      className={cn(
        "group relative block overflow-hidden rounded-3xl bg-navy",
        compact ? "h-full min-h-80" : "aspect-4/3 sm:aspect-16/9 lg:aspect-2/1",
      )}
    >
      {cover && (
        <Image
          src={cover}
          alt={collection.name}
          fill
          sizes={compact ? "320px" : "(max-width: 640px) 92vw, 60vw"}
          className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
        />
      )}
      <div className="absolute inset-x-0 bottom-0 border-t border-white/10 bg-black/45 p-4 backdrop-blur-md sm:p-5">
        <p className={cn("line-clamp-2 font-bold text-white", compact ? "text-base" : "text-lg sm:text-xl")}>
          {collection.name}
        </p>
        <p className="mt-1 text-sm text-white/75">
          {t("booksCount", { count: collection.books.length })}
        </p>
      </div>
    </Link>
  );
}
