import { useTranslations } from "next-intl";
import { RankedGridCard } from "@/components/book/ranked-book-card";
import { RowCarousel } from "@/components/book/row-carousel";
import { SectionHeader } from "@/components/book/section-header";
import type { ApiCollection } from "@/lib/api/home";
import { ApiBookCard } from "./api-book-card";
import { AuthorChipsRow } from "./author-chips-row";
import { CollectionHeroCard } from "./collection-hero-card";
import { RankedShelfCard } from "./ranked-shelf-card";

// One collection rendered as a full-width section, per the mobile spec:
// author -> avatar chips; book -> by card_type (card_1 row / card_2 ranked
// shelf / card_3 hero / card_4 ranked chart carousel). Unknown card_type is
// already normalized to card_1.
export function CollectionSection({
  collection,
}: {
  collection: ApiCollection;
}) {
  const t = useTranslations("common");

  if (collection.type === "author") {
    return <AuthorChipsRow collection={collection} />;
  }

  if (collection.card_type === "card_2") {
    return (
      <section>
        <div className="max-w-md">
          <RankedShelfCard collection={collection} />
        </div>
      </section>
    );
  }

  if (collection.card_type === "card_3") {
    return (
      <section>
        <CollectionHeroCard collection={collection} />
      </section>
    );
  }

  // Top-chart carousel: covers with big rank numerals beside them. Items are
  // wider than card_1's to leave room for the numeral gutter (ml-[22%]).
  if (collection.card_type === "card_4") {
    return (
      <section>
        <SectionHeader
          title={collection.name}
          description={collection.sub_title ?? undefined}
          href={`/collections/${collection.id}`}
          seeAllLabel={t("seeAll")}
        />
        <RowCarousel itemClassName="basis-[56%] pl-3 sm:basis-[36%] sm:pl-4 md:basis-[28%] lg:basis-[22%]">
          {collection.books.map((b, i) => (
            <RankedGridCard key={b.id} book={b} rank={i + 1} />
          ))}
        </RowCarousel>
      </section>
    );
  }

  return (
    <section>
      <SectionHeader
        title={collection.name}
        description={collection.sub_title ?? undefined}
        href={`/collections/${collection.id}`}
        seeAllLabel={t("seeAll")}
      />
      <RowCarousel>
        {collection.books.map((b) => (
          <ApiBookCard key={b.id} book={b} />
        ))}
      </RowCarousel>
    </section>
  );
}

// A run of >1 collections sharing a queue_position: one horizontal scroller
// of compact tiles (spec §3 — compact card, never a nested book row).
export function CollectionRunRow({ run }: { run: ApiCollection[] }) {
  return (
    <section className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      {run.map((c) => (
        <div key={c.id} className="w-80 shrink-0 snap-start">
          {c.type === "book" && c.card_type === "card_2" ? (
            <RankedShelfCard collection={c} compact />
          ) : c.type === "author" ? (
            <CollectionHeroAuthorTile collection={c} />
          ) : (
            <CollectionHeroCard collection={c} compact />
          )}
        </div>
      ))}
    </section>
  );
}

// Rare case: an author collection inside a multi-item run — compact tile
// with the first author's photo.
function CollectionHeroAuthorTile({ collection }: { collection: ApiCollection }) {
  return <AuthorChipsRow collection={collection} />;
}
