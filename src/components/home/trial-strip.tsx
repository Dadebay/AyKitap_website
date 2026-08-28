import { ChevronRight, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function TrialStrip() {
  const t = useTranslations("home");

  return (
    <Link
      href="/books?free=1"
      className="group flex items-center gap-4 rounded-2xl border border-primary/25 bg-card p-4 shadow-xs transition-all hover:border-primary/50 hover:shadow-md sm:px-5"
    >
      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-gradient-soft">
        <Sparkles className="size-5 text-primary" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-semibold">{t("trialBooks")}</span>
        <span className="block text-sm text-muted-foreground">
          {t("trialBooksDesc")}
        </span>
      </span>
      <ChevronRight className="size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
    </Link>
  );
}
