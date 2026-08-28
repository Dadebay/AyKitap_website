import Image from "next/image";
import { useTranslations } from "next-intl";
import { SectionHeader } from "@/components/book/section-header";
import { Link } from "@/i18n/navigation";
import { AUTHOR_PALETTE, authorInitials } from "@/components/home/author-avatar";
import type { ApiCollection } from "@/lib/api/home";
import { cn } from "@/lib/utils";

// type "author" collections — horizontally scrolling avatar chips.
export function AuthorChipsRow({ collection }: { collection: ApiCollection }) {
  const t = useTranslations("common");

  return (
    <section>
      <SectionHeader
        title={collection.name}
        description={collection.sub_title ?? undefined}
        href={`/collections/${collection.id}`}
        seeAllLabel={t("seeAll")}
      />
      <div className="no-scrollbar flex gap-4 overflow-x-auto py-2">
        {collection.authors.map((a, i) => (
          <Link
            key={a.id}
            href={`/books?author=${a.id}`}
            className="group flex w-24 shrink-0 flex-col items-center gap-2.5"
          >
            {a.image ? (
              <span className="relative size-20 overflow-hidden rounded-full shadow-md ring-2 ring-transparent transition-all group-hover:ring-primary/60">
                <Image
                  src={a.image}
                  alt={a.name}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </span>
            ) : (
              <span
                className={cn(
                  "flex size-20 items-center justify-center rounded-full text-xl font-bold text-white shadow-md ring-2 ring-transparent transition-all group-hover:ring-primary/60",
                  AUTHOR_PALETTE[i % AUTHOR_PALETTE.length],
                )}
              >
                {authorInitials(a.name)}
              </span>
            )}
            <span className="line-clamp-2 text-center text-xs font-medium leading-tight">
              {a.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
