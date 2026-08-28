import { BookX } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

export default function NotFoundPage() {
  const t = useTranslations();

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 py-20 text-center">
      <span className="flex size-20 items-center justify-center rounded-full bg-brand-gradient-soft">
        <BookX className="size-9 text-primary" />
      </span>
      <h1 className="mt-6 text-3xl font-bold">{t("notFound.title")}</h1>
      <p className="mt-2 max-w-sm text-muted-foreground">
        {t("notFound.desc")}
      </p>
      <Button asChild size="lg" className="mt-8 rounded-full px-8">
        <Link href="/">{t("common.goHome")}</Link>
      </Button>
    </div>
  );
}
