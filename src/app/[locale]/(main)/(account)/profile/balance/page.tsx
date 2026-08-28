import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { BalanceSection } from "@/components/account/balance-section";
import type { Locale } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "account" });
  return { title: t("balance") };
}

export default async function BalancePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>;
  // The card-payment flow returns the browser here with ?payment=success|failed.
  searchParams: Promise<{ payment?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { payment } = await searchParams;

  return (
    <BalanceSection
      payment={
        payment === "success" || payment === "failed" ? payment : undefined
      }
    />
  );
}
