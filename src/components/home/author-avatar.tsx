import { Link } from "@/i18n/navigation";
import type { AuthorDto } from "@/lib/types";
import { cn } from "@/lib/utils";

export const AUTHOR_PALETTE = [
  "bg-[#3e5771]",
  "bg-[#4d3e71]",
  "bg-[#71483e]",
  "bg-[#3e7154]",
  "bg-[#71603e]",
];

export function authorInitials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export function AuthorAvatar({
  author,
  index,
}: {
  author: AuthorDto;
  index: number;
}) {
  return (
    <Link
      href={`/books?author=${author.id}`}
      className="group flex w-24 flex-col items-center gap-2.5"
    >
      <span
        className={cn(
          "flex size-20 items-center justify-center rounded-full text-xl font-bold text-white shadow-md ring-2 ring-transparent transition-all group-hover:ring-primary/60",
          AUTHOR_PALETTE[index % AUTHOR_PALETTE.length],
        )}
      >
        {authorInitials(author.name)}
      </span>
      <span className="line-clamp-2 text-center text-xs font-medium leading-tight">
        {author.name}
      </span>
    </Link>
  );
}
