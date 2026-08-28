import { ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { CollectionDto } from "@/lib/types";
import { cn } from "@/lib/utils";

const backgrounds = [
  "bg-linear-to-br from-[#24344d] to-[#151c33]",
  "bg-linear-to-br from-[#4d4526] to-[#2a2415]",
];

export function CollectionCard({
  collection,
  index,
  className,
}: {
  collection: CollectionDto;
  index: number;
  className?: string;
}) {
  const t = useTranslations("common");

  return (
    <Link
      href={`/books?collection=${collection.id}`}
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden rounded-3xl p-5 text-white shadow-lg transition-transform duration-300 hover:-translate-y-0.5",
        backgrounds[index % backgrounds.length],
        className,
      )}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -right-12 -top-12 size-44 rounded-full bg-brand-gradient opacity-25 blur-3xl transition-opacity group-hover:opacity-40"
      />
      <span className="flex size-12 items-center justify-center rounded-full bg-white/10 text-2xl backdrop-blur-sm">
        {collection.icon}
      </span>
      <span className="mt-6 flex items-end justify-between gap-3">
        <span>
          <span className="block text-lg font-bold leading-snug">
            {collection.name}
          </span>
          <span className="mt-2 inline-block rounded-full bg-black/30 px-3 py-1 text-xs font-medium text-white/85">
            {t("booksCount", { count: collection.bookIds.length })}
          </span>
        </span>
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/10 transition-transform group-hover:translate-x-0.5">
          <ChevronRight className="size-4" />
        </span>
      </span>
    </Link>
  );
}
