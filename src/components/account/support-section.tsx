"use client";

import { useState } from "react";
import { Bug, Loader2, Mail, Phone, Send } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ApiError, reportProblem } from "@/lib/api/client";
import { useAuthStore } from "@/lib/stores/auth-store";
import type { ContactInfo } from "@/lib/api/contacts";

const MAX = 500;

export function SupportSection({ contact }: { contact: ContactInfo }) {
  const t = useTranslations();
  const token = useAuthStore((s) => s.accessToken);
  const forceLogout = useAuthStore((s) => s.forceLogout);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    const problem = text.trim();
    if (!token || busy || problem.length < 5) return;
    setBusy(true);
    try {
      await reportProblem(token, problem);
      setText("");
      toast.success(t("support.sent"));
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) forceLogout();
      else toast.error(t("auth.networkError"));
    } finally {
      setBusy(false);
    }
  }

  const contacts = [
    {
      href: contact.phoneHref,
      label: contact.phone,
      icon: Phone,
      external: false,
    },
    {
      href: contact.email ? `mailto:${contact.email}` : null,
      label: contact.email,
      icon: Mail,
      external: false,
    },
    {
      href: contact.telegramHref,
      label: contact.telegram,
      icon: Send,
      external: true,
    },
  ].filter((c): c is typeof c & { href: string; label: string } =>
    Boolean(c.href && c.label),
  );

  return (
    <div className="space-y-5">
      <form
        className="rounded-3xl bg-card p-6 shadow-xs ring-1 ring-black/3"
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
      >
        <div className="flex items-start gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-brand-gradient-soft text-primary">
            <Bug className="size-5" />
          </span>
          <div>
            <p className="font-bold">{t("support.title")}</p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {t("support.desc")}
            </p>
          </div>
        </div>

        <div className="relative mt-4">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, MAX))}
            rows={5}
            placeholder={t("support.placeholder")}
            className="w-full resize-none rounded-2xl border border-input bg-background px-4 py-3 pb-8 text-sm outline-none transition-colors focus-visible:border-primary/60 focus-visible:ring-[3px] focus-visible:ring-primary/20"
          />
          <span className="pointer-events-none absolute bottom-3 right-4 text-xs text-muted-foreground">
            {text.length}/{MAX}
          </span>
        </div>

        <Button
          type="submit"
          size="lg"
          disabled={text.trim().length < 5 || busy}
          className="mt-4 rounded-full px-8"
        >
          {busy ? <Loader2 className="size-4 animate-spin" /> : null}
          {t("support.send")}
        </Button>
      </form>

      {contacts.length > 0 && (
        <div className="rounded-3xl bg-card p-6 shadow-xs ring-1 ring-black/3">
          <p className="font-bold">{t("support.contactTitle")}</p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {t("support.contactDesc")}
          </p>
          <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
            {contacts.map(({ href, label, icon: Icon, external }) => (
              <li key={href}>
                <a
                  href={href}
                  {...(external
                    ? { target: "_blank", rel: "noreferrer noopener" }
                    : {})}
                  className="group flex items-center gap-3 rounded-2xl border border-border px-4 py-3 transition-colors hover:border-primary/40 hover:bg-brand-gradient-soft"
                >
                  <span className="flex size-9 items-center justify-center rounded-xl bg-muted text-muted-foreground transition-colors group-hover:bg-brand-gradient group-hover:text-white">
                    <Icon className="size-4" />
                  </span>
                  <span className="text-sm font-semibold" dir="ltr">
                    {label}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
