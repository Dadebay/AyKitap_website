import Image from "next/image";
import { Link } from "@/i18n/navigation";
import type { ApiBookSummary } from "@/lib/api/home";
import { cn } from "@/lib/utils";

// Chart numeral drawn as SVG so its height always equals the cover height
// exactly (a DOM text node can't be size-locked to a sibling). Baseline sits
// on the viewBox bottom, and 139/100 ≈ 1/cap-height makes the glyph span the
// full height.
export function RankNumeral({
  rank,
  className,
}: {
  rank: number;
  className?: string;
}) {
  return (
    <svg
      viewBox={`0 0 ${rank < 10 ? 75 : 150} 100`}
      preserveAspectRatio="xMinYMax meet"
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-y-0 left-0 h-full w-auto select-none overflow-visible",
        className,
      )}
    >
      <text
        x="0"
        y="100"
        fontSize="109"
        fontWeight="500"
        letterSpacing="-0.04em"
        fill="currentColor"
      >
        {rank}
      </text>
    </svg>
  );
}

// Ranked-chart book card (card_2 detail grid, card_4 home carousel): a chart
// numeral sits behind each cover, and its hidden part shows through over the
// cover as a translucent continuation (backend already orders books by
// collection_books.order).
export function RankedGridCard({
  book,
  rank,
}: {
  book: ApiBookSummary;
  rank: number;
}) {
  return (
    <Link href={`/books/${book.id}`} className="group block">
      <span className="relative block">
        <RankNumeral rank={rank} className="z-0 text-foreground" />
        <span className="relative z-10 ml-[22%] block aspect-2/3 overflow-hidden rounded-xl bg-muted shadow-md transition-transform group-hover:-translate-y-1">
          {book.image && (
            <Image
              src={book.image}
              alt={book.name}
              fill
              sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 200px"
              className="object-cover"
            />
          )}
        </span>
        <RankNumeral rank={rank} className="z-20 text-foreground/60" />
      </span>
      <span className="mt-3 line-clamp-1 block text-sm text-muted-foreground">
        {book.authors.map((a) => a.name).join(", ")}
      </span>
      <span className="line-clamp-1 block font-semibold leading-snug">
        {book.name}
      </span>
    </Link>
  );
}
