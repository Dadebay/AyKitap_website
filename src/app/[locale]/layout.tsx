import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { gilroy } from "@/lib/fonts";
import { ChunkErrorRecovery } from "@/components/layout/chunk-error-recovery";
import { ServiceWorkerRegistration } from "@/components/service-worker-registration";
import { Toaster } from "@/components/ui/sonner";
import "../globals.css";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "footer" });
  return {
    title: {
      default: "Aýkitap",
      template: "%s | Aýkitap",
    },
    description: t("tagline"),
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  return (
    <html lang={locale} className={`${gilroy.variable} antialiased`}>
      <body className="flex min-h-screen flex-col">
        <NextIntlClientProvider>
          <ChunkErrorRecovery />
          <ServiceWorkerRegistration />
          {children}
          <Toaster position="top-center" richColors />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
