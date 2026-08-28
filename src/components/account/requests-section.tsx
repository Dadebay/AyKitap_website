"use client";

import { useEffect, useState } from "react";
import { BookPlus, Loader2, Plus, Trash2 } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ApiError,
  createSuggest,
  deleteSuggest,
  fetchMySuggests,
  type Suggest,
  type SuggestLanguage,
  type SuggestStatus,
} from "@/lib/api/client";
import { useAuthStore } from "@/lib/stores/auth-store";
import { cn } from "@/lib/utils";

const LANGUAGES: SuggestLanguage[] = ["tk", "tr", "ru", "en", "other"];

const STATUS_STYLES: Record<SuggestStatus, string> = {
  new: "bg-primary/10 text-primary",
  accepted: "bg-sky-500/10 text-sky-600",
  processing: "bg-amber-500/10 text-amber-600",
  completed: "bg-emerald-500/10 text-emerald-600",
  rejected: "bg-destructive/10 text-destructive",
};

function RequestDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}) {
  const t = useTranslations();
  const token = useAuthStore((s) => s.accessToken);
  const forceLogout = useAuthStore((s) => s.forceLogout);
  const [name, setName] = useState("");
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");
  const [language, setLanguage] = useState<SuggestLanguage>("tk");
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!token || busy || name.trim().length < 2) return;
    setBusy(true);
    try {
      await createSuggest(token, {
        name: name.trim(),
        author: author.trim() || undefined,
        description: description.trim() || undefined,
        language,
      });
      toast.success(t("requests.created"));
      setName("");
      setAuthor("");
      setDescription("");
      onOpenChange(false);
      onCreated();
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) forceLogout();
      else if (e instanceof ApiError && e.status === 400)
        toast.error(t("requests.dailyLimit"));
      else toast.error(t("auth.networkError"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookPlus className="size-5 text-primary" />
            {t("requests.newTitle")}
          </DialogTitle>
          <DialogDescription>{t("requests.newDesc")}</DialogDescription>
        </DialogHeader>

        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            void submit();
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="req-name">{t("requests.bookName")}</Label>
            <Input
              id="req-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("requests.bookNamePlaceholder")}
              className="h-11 rounded-2xl bg-background"
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="req-author">{t("requests.authorName")}</Label>
            <Input
              id="req-author"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder={t("requests.authorPlaceholder")}
              className="h-11 rounded-2xl bg-background"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="req-desc">{t("requests.description")}</Label>
            <textarea
              id="req-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder={t("requests.descriptionPlaceholder")}
              className="w-full resize-none rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none transition-colors focus-visible:border-primary/60 focus-visible:ring-[3px] focus-visible:ring-primary/20"
            />
          </div>
          <div className="space-y-2">
            <Label>{t("requests.language")}</Label>
            <div className="flex flex-wrap gap-2">
              {LANGUAGES.map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => setLanguage(code)}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                    language === code
                      ? "bg-brand-gradient text-white shadow-sm shadow-primary/25"
                      : "bg-muted text-muted-foreground hover:text-foreground",
                  )}
                >
                  {t(`requests.languages.${code}`)}
                </button>
              ))}
            </div>
          </div>

          <Button
            type="submit"
            size="lg"
            disabled={name.trim().length < 2 || busy}
            className="w-full rounded-full"
          >
            {busy ? <Loader2 className="size-4 animate-spin" /> : null}
            {t("requests.submit")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function RequestsSection() {
  const t = useTranslations();
  const format = useFormatter();
  const token = useAuthStore((s) => s.accessToken);
  const forceLogout = useAuthStore((s) => s.forceLogout);
  const [items, setItems] = useState<Suggest[] | null>(null);
  const [open, setOpen] = useState(false);
  const [removing, setRemoving] = useState<number | null>(null);
  // Bumped after creating a request so the list refetches.
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    void (async () => {
      try {
        const data = await fetchMySuggests(token);
        if (!cancelled) setItems(data);
      } catch (e) {
        if (cancelled) return;
        if (e instanceof ApiError && e.status === 401) forceLogout();
        else setItems([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, forceLogout, reloadKey]);

  async function remove(id: number) {
    if (!token || removing) return;
    setRemoving(id);
    try {
      await deleteSuggest(token, id);
      setItems((prev) => prev?.filter((s) => s.id !== id) ?? null);
      toast.success(t("requests.deleted"));
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) forceLogout();
      else toast.error(t("auth.networkError"));
    } finally {
      setRemoving(null);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 rounded-3xl bg-card p-6 shadow-xs ring-1 ring-black/3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-brand-gradient-soft text-primary">
            <BookPlus className="size-5" />
          </span>
          <div>
            <p className="font-bold">{t("requests.introTitle")}</p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {t("requests.introDesc")}
            </p>
          </div>
        </div>
        <Button
          className="shrink-0 rounded-full"
          size="lg"
          onClick={() => setOpen(true)}
        >
          <Plus className="size-4.5" />
          {t("requests.new")}
        </Button>
      </div>

      {items === null ? (
        <div className="space-y-2.5">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-2xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-card/50 px-6 py-14 text-center">
          <p className="font-semibold">{t("requests.empty")}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("requests.emptyDesc")}
          </p>
        </div>
      ) : (
        <ul className="space-y-2.5">
          {items.map((s) => (
            <li
              key={s.id}
              className="flex items-start gap-4 rounded-2xl bg-card px-5 py-4 shadow-xs ring-1 ring-black/3"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold">{s.name}</p>
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-[11px] font-bold",
                      STATUS_STYLES[s.status] ?? STATUS_STYLES.new,
                    )}
                  >
                    {t(`requests.statuses.${s.status}`)}
                  </span>
                </div>
                {s.author && (
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {s.author}
                  </p>
                )}
                <p className="mt-1 text-xs text-muted-foreground">
                  {format.dateTime(new Date(s.created_at), {
                    dateStyle: "medium",
                  })}
                </p>
              </div>
              {s.status === "new" && (
                <button
                  type="button"
                  aria-label={t("requests.delete")}
                  disabled={removing === s.id}
                  onClick={() => void remove(s.id)}
                  className="shrink-0 rounded-full p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                >
                  {removing === s.id ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Trash2 className="size-4" />
                  )}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      <RequestDialog
        open={open}
        onOpenChange={setOpen}
        onCreated={() => setReloadKey((k) => k + 1)}
      />
    </div>
  );
}
