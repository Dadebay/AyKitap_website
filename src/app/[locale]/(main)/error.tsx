"use client";

import { useEffect } from "react";
import { RotateCcw, TriangleAlert } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

// Rendered instead of a dead page when something throws client-side (a failed
// chunk, a broken response). Gives the user a retry instead of a blank screen.
export default function MainError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations();

  useEffect(() => {
    console.error(error);
    // Chunk fetches get reset on flaky networks; one fresh reload almost
    // always recovers. The timestamp guard stops a broken deploy from
    // looping the page forever.
    const isChunkError =
      error.name === "ChunkLoadError" || /load chunk/i.test(error.message);
    if (!isChunkError) return;
    const lastReload = Number(sessionStorage.getItem("chunk-reload-at") ?? 0);
    if (Date.now() - lastReload < 30_000) return;
    sessionStorage.setItem("chunk-reload-at", String(Date.now()));
    window.location.reload();
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 py-20 text-center">
      <span className="flex size-20 items-center justify-center rounded-full bg-brand-gradient-soft">
        <TriangleAlert className="size-9 text-primary" />
      </span>
      <h1 className="mt-6 text-3xl font-bold">{t("error.title")}</h1>
      <p className="mt-2 max-w-sm text-muted-foreground">{t("error.desc")}</p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button size="lg" className="rounded-full px-8" onClick={() => reset()}>
          <RotateCcw className="size-4.5" />
          {t("error.retry")}
        </Button>
        <Button asChild size="lg" variant="outline" className="rounded-full px-8">
          <Link href="/">{t("common.goHome")}</Link>
        </Button>
      </div>
    </div>
  );
}
