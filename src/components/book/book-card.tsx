import Image from "next/image";
import { BookOpen } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { BookDto } from "@/lib/types";
import { WishlistButton } from "./wishlist-button";

// Catalog cards deliberately carry no price/subscription badge — pricing is
// shown only on the book detail page.
export function BookCard({ book }: { book: BookDto }) {
  const byline = book.authors.map((a) => a.name).join(", ");

  return (
    <div className="group relative">
      <Link href={`/books/${book.id}`} className="block">
        <div className="relative aspect-2/3 overflow-hidden rounded-2xl bg-muted shadow-sm ring-1 ring-black/5 transition-shadow duration-300 group-hover:shadow-xl group-hover:shadow-foreground/10">
          {/* An empty src makes the browser re-request the whole page — books
              without a cover get a placeholder instead. */}
          {book.image ? (
            <Image
              src={book.image}
              alt={book.name}
              fill
              sizes="(max-width: 640px) 45vw, (max-width: 1024px) 28vw, 210px"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            />
          ) : (
            <span className="flex size-full items-center justify-center bg-brand-gradient-soft">
              <BookOpen className="size-8 text-primary/50" />
            </span>
          )}
        </div>
        <h3 className="mt-3 line-clamp-1 text-[15px] font-semibold leading-snug">
          {book.name}
        </h3>
        <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">
          {byline}
        </p>
      </Link>
      <WishlistButton
        book={{
          id: book.id,
          name: book.name,
          image: book.image,
          price: book.price,
          authors: byline,
        }}
        className="absolute right-2.5 top-2.5 size-9 opacity-0 transition-opacity duration-200 focus-visible:opacity-100 group-hover:opacity-100 max-lg:opacity-100"
      />
    </div>
  );
}
