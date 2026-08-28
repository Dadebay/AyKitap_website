import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SupportSection } from "@/components/account/support-section";
import type { Locale } from "@/i18n/routing";
import { getContactInfo } from "@/lib/api/contacts";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "account" });
  return { title: t("support") };
}

export default async function SupportPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  // Contact details come from the admin panel (same source as the footer).
  const contact = await getContactInfo();

  return <SupportSection contact={contact} />;
}
