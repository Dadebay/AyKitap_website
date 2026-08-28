import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { WishlistButton } from "@/components/book/wishlist-button";
import type { ApiBookSummary } from "@/lib/api/home";

// Same visual card as BookCard, driven by the collection summary shape
// (no price on summaries -> no price pill).
export function ApiBookCard({ book }: { book: ApiBookSummary }) {
  const byline = book.authors.map((a) => a.name).join(", ");

  return (
    <div className="group relative">
      <Link href={`/books/${book.id}`} className="block">
        <div className="relative aspect-2/3 overflow-hidden rounded-2xl bg-muted shadow-sm ring-1 ring-black/5 transition-shadow duration-300 group-hover:shadow-xl group-hover:shadow-foreground/10">
          {book.image && (
            <Image
              src={book.image}
              alt={book.name}
              fill
              sizes="(max-width: 640px) 45vw, (max-width: 1024px) 28vw, 210px"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            />
          )}
        </div>
        <h3 className="mt-3 line-clamp-1 text-[15px] font-semibold leading-snug">
          {book.name}
        </h3>
        {byline && (
          <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">
            {byline}
          </p>
        )}
      </Link>
      <WishlistButton
        book={{
          id: book.id,
          name: book.name,
          image: book.image,
          price: null,
          authors: byline,
        }}
        className="absolute right-2.5 top-2.5 size-9 opacity-0 transition-opacity duration-200 focus-visible:opacity-100 group-hover:opacity-100 max-lg:opacity-100"
      />
    </div>
  );
}
