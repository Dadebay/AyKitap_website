import { CalendarDays } from "lucide-react";
import { getTranslations } from "next-intl/server";

export async function LegalArticle({
  namespace,
  icon,
}: {
  namespace: "termsPage" | "privacyPage";
  icon: React.ReactNode;
}) {
  const t = await getTranslations(namespace);
  const sections = t.raw("sections") as { title: string; body: string }[];

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <header>
        <span className="flex size-14 items-center justify-center rounded-2xl bg-brand-gradient-soft">
          {icon}
        </span>
        <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
          {t("title")}
        </h1>
        <span className="mt-3 block h-[3px] w-9 rounded-full bg-brand-gradient" />
        <p className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-muted px-3.5 py-1.5 text-xs font-medium text-muted-foreground">
          <CalendarDays className="size-3.5" />
          {t("updated")}
        </p>
        <p className="mt-5 leading-relaxed text-foreground/80">{t("intro")}</p>
      </header>

      <ol className="mt-8 space-y-4">
        {sections.map((s, i) => (
          <li
            key={s.title}
            className="rounded-3xl bg-card p-6 shadow-xs ring-1 ring-black/3 sm:p-7"
          >
            <h2 className="flex items-baseline gap-3 text-lg font-bold">
              <span className="text-brand-gradient text-xl font-extrabold tabular-nums">
                {String(i + 1).padStart(2, "0")}
              </span>
              {s.title}
            </h2>
            <p className="mt-2.5 leading-relaxed text-muted-foreground">
              {s.body}
            </p>
          </li>
        ))}
      </ol>
    </div>
  );
}
