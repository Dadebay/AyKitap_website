import type { Metadata } from "next";
import { ScrollText } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LegalArticle } from "@/components/legal/legal-article";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "termsPage" });
  return { title: t("title") };
}

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <LegalArticle
      namespace="termsPage"
      icon={<ScrollText className="size-6 text-primary" />}
    />
  );
}
