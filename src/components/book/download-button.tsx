"use client";

import { useState } from "react";
import { Download, FileText, Loader2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { ApiError, fetchBookFiles, getFileLink } from "@/lib/api/client";
import { formatBytes } from "@/lib/format";
import { localeToLang } from "@/lib/i18n-lang";
import { useAuthStore } from "@/lib/stores/auth-store";
import type { BookFileDto } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Downloads a purchased book. `files` comes free with the detail page; on
 * cards (list endpoints carry no files) they are fetched on first click.
 * A single file downloads straight away, several open a format picker.
 */

// Same-tab anchor click: the presigned URL is served with
// Content-Disposition: attachment, so the browser stays on this page and
// just shows its download UI — no blank tab, no inline viewer.
function triggerDownload(url: string) {
  const a = document.createElement("a");
  a.href = url;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
}
export function DownloadButton({
  bookId,
  files,
  className,
  size = "lg",
  label,
  variant = "default",
}: {
  bookId: number;
  files?: BookFileDto[];
  className?: string;
  size?: "sm" | "lg";
  label?: string;
  variant?: "default" | "outline";
}) {
  const t = useTranslations();
  const locale = useLocale() as Locale;
  const router = useRouter();
  const token = useAuthStore((s) => s.accessToken);
  const forceLogout = useAuthStore((s) => s.forceLogout);
  const [busy, setBusy] = useState(false);
  const [picker, setPicker] = useState<BookFileDto[] | null>(null);

  function handleError(e: unknown) {
    if (e instanceof ApiError && e.status === 401) {
      forceLogout();
      router.push("/login");
    } else if (e instanceof ApiError && e.status === 403) {
      toast.error(t("library.notOwned"));
    } else {
      toast.error(t("auth.networkError"));
    }
  }

  async function download(file: BookFileDto) {
    if (!token) return;
    setBusy(true);
    try {
      const { url } = await getFileLink(token, file.file_key);
      triggerDownload(url);
      setPicker(null);
    } catch (e) {
      handleError(e);
    } finally {
      setBusy(false);
    }
  }

  async function handleClick() {
    if (!token || busy) return;
    setBusy(true);
    try {
      const list = files?.length
        ? files
        : await fetchBookFiles(bookId, localeToLang[locale]);
      if (list.length === 0) {
        toast.error(t("library.noFile"));
        return;
      }
      if (list.length === 1) {
        const { url } = await getFileLink(token, list[0].file_key);
        triggerDownload(url);
        return;
      }
      setPicker(list);
    } catch (e) {
      handleError(e);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Button
        size={size === "lg" ? "lg" : "sm"}
        variant={variant}
        disabled={busy}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          void handleClick();
        }}
        className={cn(
          "rounded-full font-semibold",
          size === "lg" && "h-12 flex-1 text-base shadow-lg shadow-primary/25",
          className,
        )}
      >
        {busy ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Download className={size === "lg" ? "size-5" : "size-4"} />
        )}
        {label ?? t("library.download")}
      </Button>

      <Dialog open={!!picker} onOpenChange={(o) => !o && setPicker(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{t("library.chooseFormat")}</DialogTitle>
            <DialogDescription>
              {t("library.chooseFormatDesc")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {picker?.map((f) => (
              <button
                key={f.id}
                type="button"
                disabled={busy}
                onClick={() => void download(f)}
                className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 text-left transition-colors hover:border-primary/40 hover:bg-brand-gradient-soft disabled:opacity-60"
              >
                <span className="flex size-9 items-center justify-center rounded-xl bg-brand-gradient-soft text-primary">
                  <FileText className="size-4.5" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold">
                    {f.format || "FILE"}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {formatBytes(f.size)}
                  </span>
                </span>
                <Download className="ml-auto size-4 text-muted-foreground" />
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
