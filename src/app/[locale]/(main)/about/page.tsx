import type { Metadata } from "next";
import Image from "next/image";
import {
  Languages,
  LibraryBig,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

const FEATURE_ICONS = [LibraryBig, Smartphone, Languages, ShieldCheck];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "aboutPage" });
  return { title: t("title") };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("aboutPage");
  const features = t.raw("features") as { title: string; body: string }[];

  const stats = [
    { value: "1000+", label: t("statBooks") },
    { value: "200+", label: t("statAuthors") },
    { value: "3", label: t("statLangs") },
    { value: "50K+", label: t("statReaders") },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="relative overflow-hidden rounded-[2rem] bg-card px-6 py-14 text-center shadow-xs ring-1 ring-black/3 sm:px-10 sm:py-20">
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-brand-gradient"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute -left-24 -top-24 size-72 rounded-full bg-brand-gradient opacity-10 blur-3xl"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute -bottom-24 -right-24 size-72 rounded-full bg-brand-gradient opacity-10 blur-3xl"
        />
        <Image
          src="/logo.png"
          alt="Aýkitap"
          width={72}
          height={72}
          className="mx-auto size-18 rounded-2xl shadow-lg"
        />
        <h1 className="mx-auto mt-6 max-w-2xl text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
          {t("heroTitle")}
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          {t("heroText")}
        </p>
      </section>

      <section className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-3xl bg-card px-4 py-7 text-center shadow-xs ring-1 ring-black/3"
          >
            <div className="text-brand-gradient text-3xl font-extrabold sm:text-4xl">
              {s.value}
            </div>
            <div className="mt-1.5 text-sm font-medium text-muted-foreground">
              {s.label}
            </div>
          </div>
        ))}
      </section>

      <section className="mt-16">
        <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
          {t("featuresTitle")}
        </h2>
        <span className="mx-auto mt-3 block h-[3px] w-9 rounded-full bg-brand-gradient" />
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {features.map((f, i) => {
            const Icon = FEATURE_ICONS[i % FEATURE_ICONS.length];
            return (
              <div
                key={f.title}
                className="group rounded-3xl bg-card p-7 shadow-xs ring-1 ring-black/3 transition-shadow hover:shadow-md"
              >
                <span className="flex size-12 items-center justify-center rounded-2xl bg-brand-gradient-soft transition-transform group-hover:scale-105">
                  <Icon className="size-5.5 text-primary" />
                </span>
                <h3 className="mt-4 text-lg font-bold">{f.title}</h3>
                <p className="mt-1.5 leading-relaxed text-muted-foreground">
                  {f.body}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="relative mt-16 overflow-hidden rounded-[2rem] bg-navy px-6 py-14 text-center text-white sm:px-10">
        <span
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-brand-gradient opacity-25 blur-3xl"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute -bottom-20 -left-16 size-64 rounded-full bg-brand-gradient opacity-15 blur-3xl"
        />
        <h2 className="relative text-2xl font-bold tracking-tight sm:text-3xl">
          {t("ctaTitle")}
        </h2>
        <p className="relative mx-auto mt-3 max-w-md text-white/70">
          {t("ctaText")}
        </p>
        <Button
          asChild
          size="lg"
          className="relative mt-8 h-12 rounded-full px-10 text-base font-semibold shadow-lg shadow-primary/30"
        >
          <Link href="/books">{t("ctaButton")}</Link>
        </Button>
      </section>
    </div>
  );
}
