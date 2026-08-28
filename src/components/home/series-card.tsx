import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { SeriesDto } from "@/lib/types";

export function SeriesCard({ series }: { series: SeriesDto }) {
  const t = useTranslations();

  return (
    <Link
      href={`/books?series=${series.id}`}
      className="group relative block aspect-4/3 overflow-hidden rounded-3xl bg-muted sm:aspect-16/10"
    >
      {series.image && (
        <Image
          src={series.image}
          alt={series.name}
          fill
          sizes="(max-width: 640px) 92vw, 45vw"
          className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
        />
      )}
      <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/85 via-black/40 to-transparent p-5 pt-20 sm:p-6">
        <p className="text-lg font-bold text-white sm:text-xl">
          {t("home.seriesPrefix")} «{series.name}»
        </p>
        <p className="mt-1 text-sm text-white/70">
          {t("common.booksCount", { count: series.bookIds.length })}
        </p>
      </div>
    </Link>
  );
}
