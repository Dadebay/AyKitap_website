import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LibrarySection } from "@/components/account/library-section";
import type { Locale } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "account" });
  return { title: t("myBooks") };
}

export default async function MyBooksPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <LibrarySection />;
}
