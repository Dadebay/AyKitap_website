"use client";

import { useEffect, useRef, useState } from "react";
import {
  BookOpen,
  Clock,
  CreditCard,
  Loader2,
  Sparkles,
  TicketPercent,
  Wallet,
} from "lucide-react";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ApiError,
  createTopUpOrder,
  fetchBalanceLogs,
  fetchBanks,
  fetchPaymentsActive,
  redeemPromo,
  type BalanceEvent,
  type BalanceLog,
  type PaymentBank,
} from "@/lib/api/client";
import { useRouter } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { localeToLang, localizedText } from "@/lib/i18n-lang";
import { useAuthStore } from "@/lib/stores/auth-store";
import { cn } from "@/lib/utils";

const DEPOSIT_EVENTS: BalanceEvent[] = [
  "DEPOSIT_BY_CARD",
  "DEPOSIT_BY_PROMO",
  "DEPOSIT_BY_TMCELL",
  "REWARD_BY_STREAK",
];

function eventIcon(event: BalanceEvent) {
  if (event === "DEPOSIT_BY_PROMO") return TicketPercent;
  if (event === "DEPOSIT_BY_CARD" || event === "DEPOSIT_BY_TMCELL")
    return CreditCard;
  if (event === "BUY_BOOK") return BookOpen;
  return Sparkles;
}

function PromoForm({ onDone }: { onDone: () => void }) {
  const t = useTranslations();
  const token = useAuthStore((s) => s.accessToken);
  const refreshMe = useAuthStore((s) => s.refreshMe);
  const forceLogout = useAuthStore((s) => s.forceLogout);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    const value = code.trim();
    if (!token || !value || busy) return;
    setBusy(true);
    try {
      await redeemPromo(token, value);
      await refreshMe();
      setCode("");
      toast.success(t("balance.promoSuccess"));
      onDone();
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) {
        toast.error(t("balance.promoNotFound"));
      } else if (e instanceof ApiError && e.status === 400) {
        toast.error(t("balance.promoUsed"));
      } else if (e instanceof ApiError && e.status === 401) {
        forceLogout();
      } else {
        toast.error(t("auth.networkError"));
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      className="rounded-3xl bg-card p-6 shadow-xs ring-1 ring-black/3"
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
    >
      <span className="flex size-11 items-center justify-center rounded-2xl bg-brand-gradient-soft text-primary">
        <TicketPercent className="size-5" />
      </span>
      <h3 className="mt-4 font-bold">{t("balance.promoTitle")}</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        {t("balance.promoDesc")}
      </p>
      <div className="mt-4 flex gap-2">
        <Input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder={t("balance.promoPlaceholder")}
          className="h-11 rounded-full bg-background font-mono tracking-wider"
        />
        <Button
          type="submit"
          disabled={!code.trim() || busy}
          className="h-11 shrink-0 rounded-full px-6"
        >
          {busy ? <Loader2 className="size-4 animate-spin" /> : null}
          {t("balance.promoApply")}
        </Button>
      </div>
    </form>
  );
}

function TopUpForm() {
  const t = useTranslations();
  const token = useAuthStore((s) => s.accessToken);
  const forceLogout = useAuthStore((s) => s.forceLogout);
  const [active, setActive] = useState<boolean | null>(null);
  const [banks, setBanks] = useState<PaymentBank[]>([]);
  const [amount, setAmount] = useState("");
  const [bankId, setBankId] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const [isActive, bankList] = await Promise.all([
          fetchPaymentsActive(),
          fetchBanks(),
        ]);
        if (cancelled) return;
        setActive(isActive && bankList.length > 0);
        setBanks(bankList);
        if (bankList.length === 1) setBankId(bankList[0].id);
      } catch {
        if (!cancelled) setActive(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const parsedAmount = Number.parseInt(amount, 10);
  const validAmount =
    Number.isInteger(parsedAmount) && parsedAmount >= 1 && parsedAmount <= 10000;

  async function submit() {
    if (!token || !validAmount || bankId === null || busy) return;
    setBusy(true);
    try {
      const invoiceUrl = await createTopUpOrder(token, parsedAmount, bankId);
      // The bank sends the browser back to /profile/balance?payment=… — the
      // whole page navigates away, no need to reset `busy` on success.
      window.location.href = invoiceUrl;
    } catch (e) {
      setBusy(false);
      if (e instanceof ApiError && e.status === 401) forceLogout();
      else toast.error(t("balance.paymentFailed"));
    }
  }

  // Payments disabled by the admin (or still loading): keep the muted card.
  if (active !== true) {
    return (
      <div className="relative overflow-hidden rounded-3xl bg-card p-6 shadow-xs ring-1 ring-black/3">
        {active === false && (
          <span className="absolute right-5 top-5 rounded-full bg-muted px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
            {t("balance.soon")}
          </span>
        )}
        <span className="flex size-11 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          <CreditCard className="size-5" />
        </span>
        <h3 className="mt-4 font-bold text-muted-foreground">
          {t("balance.cardTitle")}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("balance.cardDesc")}
        </p>
        <Button
          disabled
          className="mt-4 h-11 rounded-full px-6"
          variant="outline"
        >
          {t("balance.topUp")}
        </Button>
      </div>
    );
  }

  return (
    <form
      className="rounded-3xl bg-card p-6 shadow-xs ring-1 ring-black/3"
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
    >
      <span className="flex size-11 items-center justify-center rounded-2xl bg-brand-gradient-soft text-primary">
        <CreditCard className="size-5" />
      </span>
      <h3 className="mt-4 font-bold">{t("balance.cardTitle")}</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        {t("balance.cardDesc")}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {banks.map((bank) => (
          <button
            key={bank.id}
            type="button"
            onClick={() => setBankId(bank.id)}
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
              bankId === bank.id
                ? "border-primary bg-brand-gradient-soft text-primary"
                : "border-border text-muted-foreground hover:border-primary/50",
            )}
          >
            {bank.name}
          </button>
        ))}
      </div>

      <div className="mt-3 flex gap-2">
        <Input
          type="number"
          inputMode="numeric"
          min={1}
          max={10000}
          step={1}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder={t("balance.amountPlaceholder")}
          className="h-11 rounded-full bg-background"
        />
        <Button
          type="submit"
          disabled={!validAmount || bankId === null || busy}
          className="h-11 shrink-0 rounded-full px-6"
        >
          {busy ? <Loader2 className="size-4 animate-spin" /> : null}
          {t("balance.payNow")}
        </Button>
      </div>
    </form>
  );
}

export function BalanceSection({
  payment,
}: {
  payment?: "success" | "failed";
}) {
  const t = useTranslations();
  const format = useFormatter();
  const locale = useLocale() as Locale;
  const router = useRouter();
  const token = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);
  const refreshMe = useAuthStore((s) => s.refreshMe);
  const forceLogout = useAuthStore((s) => s.forceLogout);
  const [logs, setLogs] = useState<BalanceLog[] | null>(null);
  // Bumped after a successful promo redemption to refetch the history.
  const [reloadKey, setReloadKey] = useState(0);
  const paymentHandled = useRef(false);

  // Coming back from the bank: toast the result once, refresh the balance
  // and strip the query param so a reload doesn't re-toast.
  useEffect(() => {
    if (!payment || paymentHandled.current) return;
    paymentHandled.current = true;
    if (payment === "success") {
      toast.success(t("balance.paymentSuccess"));
      void refreshMe();
      setReloadKey((k) => k + 1);
    } else {
      toast.error(t("balance.paymentFailed"));
    }
    router.replace("/profile/balance");
  }, [payment, refreshMe, router, t]);

  // `locale` is a dependency on purpose: the log's book name is localized.
  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    void (async () => {
      try {
        const data = await fetchBalanceLogs(token, localeToLang[locale]);
        if (!cancelled) setLogs(data);
      } catch (e) {
        if (cancelled) return;
        if (e instanceof ApiError && e.status === 401) forceLogout();
        else setLogs([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, locale, forceLogout, reloadKey]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-3xl bg-brand-gradient p-6 text-white shadow-lg shadow-primary/20 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="flex items-center gap-2 text-sm font-medium text-white/80">
            <Wallet className="size-4" />
            {t("account.balance")}
          </span>
          <p className="mt-2 text-4xl font-extrabold">
            {user?.balance ?? 0}{" "}
            <span className="text-lg font-semibold text-white/80">
              {t("common.manat")}
            </span>
          </p>
        </div>
        <p className="max-w-xs text-sm text-white/85">
          {t("balance.cardHint")}
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <PromoForm onDone={() => setReloadKey((k) => k + 1)} />
        <TopUpForm />
      </div>

      <section>
        <h2 className="flex items-center gap-2 text-lg font-bold">
          <Clock className="size-4.5 text-primary" />
          {t("balance.history")}
        </h2>
        <div className="mt-4">
          {logs === null ? (
            <div className="space-y-2.5">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-2xl" />
              ))}
            </div>
          ) : logs.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border bg-card/50 px-6 py-12 text-center">
              <p className="font-semibold">{t("balance.historyEmpty")}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("balance.historyEmptyDesc")}
              </p>
            </div>
          ) : (
            <ul className="space-y-2.5">
              {logs.map((log) => {
                const Icon = eventIcon(log.event);
                const isDeposit = DEPOSIT_EVENTS.includes(log.event);
                const bookName = localizedText(
                  log.book_name,
                  localeToLang[locale],
                );
                return (
                  <li
                    key={log.id}
                    className="flex items-center gap-3.5 rounded-2xl bg-card px-4 py-3.5 shadow-xs ring-1 ring-black/3"
                  >
                    <span
                      className={
                        isDeposit
                          ? "flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600"
                          : "flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-gradient-soft text-primary"
                      }
                    >
                      <Icon className="size-4.5" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-semibold">
                        {t(`balance.events.${log.event}`)}
                      </p>
                      <p className="mt-0.5 truncate text-sm text-muted-foreground">
                        {bookName ? `${bookName} · ` : ""}
                        {format.dateTime(new Date(log.created_at), {
                          dateStyle: "medium",
                        })}
                      </p>
                    </div>
                    <span
                      className={
                        isDeposit
                          ? "ml-auto shrink-0 font-bold text-emerald-600"
                          : "ml-auto shrink-0 font-bold text-foreground"
                      }
                    >
                      {isDeposit ? "+" : "−"}
                      {log.amount} {t("common.manat")}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
