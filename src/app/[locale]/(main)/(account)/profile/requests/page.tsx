import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { RequestsSection } from "@/components/account/requests-section";
import type { Locale } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "account" });
  return { title: t("requests") };
}

export default async function RequestsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <RequestsSection />;
}
