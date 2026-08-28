import Image from "next/image";
import { Star } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import type { BookDto } from "@/lib/types";

export function EditorsPickCard({ books }: { books: BookDto[] }) {
  const t = useTranslations();

  return (
    <div className="flex flex-col overflow-hidden rounded-3xl bg-navy text-white shadow-xl">
      <div className="relative h-36 shrink-0 sm:h-40">
        <Image
          src="/banners/banner_01.jpg"
          alt=""
          fill
          sizes="(max-width: 1024px) 100vw, 640px"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-navy via-navy/50 to-navy/10" />
        <div className="absolute inset-x-6 bottom-4">
          <div className="flex items-center gap-2 text-lg font-bold sm:text-xl">
            <Star className="size-5 fill-amber-400 text-amber-400" />
            {t("home.editorsPick")}
          </div>
          <p className="mt-0.5 text-sm text-white/70">
            {t("home.editorsPickDesc")}
          </p>
        </div>
      </div>

      <ol className="flex-1 space-y-1 px-3 py-3 sm:px-4">
        {books.map((b, i) => (
          <li key={b.id}>
            <Link
              href={`/books/${b.id}`}
              className="flex items-center gap-4 rounded-2xl p-2.5 transition-colors hover:bg-white/5"
            >
              <span className="w-7 shrink-0 text-center text-2xl font-extrabold text-brand-gradient">
                {i + 1}
              </span>
              <span className="relative h-16 w-11 shrink-0 overflow-hidden rounded-lg bg-white/10">
                {b.image && (
                  <Image
                    src={b.image}
                    alt={b.name}
                    fill
                    sizes="44px"
                    className="object-cover"
                  />
                )}
              </span>
              <span className="min-w-0">
                <span className="line-clamp-1 block font-semibold">
                  {b.name}
                </span>
                <span className="line-clamp-1 block text-sm text-white/60">
                  {b.authors.map((a) => a.name).join(", ")}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ol>

      <div className="px-5 pb-5 sm:px-6 sm:pb-6">
        <Button
          asChild
          variant="outline"
          className="w-full rounded-xl border-white/25 bg-transparent text-white hover:bg-white/10 hover:text-white"
        >
          <Link href="/books">{t("common.more")}</Link>
        </Button>
      </div>
    </div>
  );
}
