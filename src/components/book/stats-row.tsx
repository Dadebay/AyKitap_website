import { useTranslations } from "next-intl";
import { formatCount } from "@/lib/format";
import type { BookDto } from "@/lib/types";

export function StatsRow({ book }: { book: BookDto }) {
  const t = useTranslations("book");
  const stats = [
    { value: formatCount(book?.view_count), label: t("statRead") },
    { value: formatCount(book?.download_count), label: t("statBought") },
    { value: String(book?.page_count), label: t("statPages") },
  ];

  return (
    <div className="flex items-center justify-center gap-6 sm:justify-start sm:gap-8">
      {stats.map((s, i) => (
        <div key={s.label} className="flex items-center gap-6 sm:gap-8">
          {i > 0 && <span className="h-8 w-px bg-border" />}
          <div className="text-center">
            <div className="text-lg font-bold sm:text-xl">{s.value}</div>
            <div className="text-xs text-muted-foreground sm:text-sm">
              {s.label}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
