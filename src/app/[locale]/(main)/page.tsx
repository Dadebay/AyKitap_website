import { setRequestLocale } from "next-intl/server";
import { AppPromo } from "@/components/home/app-promo";
import { BannerCarousel } from "@/components/home/banner-carousel";
import {
  CollectionRunRow,
  CollectionSection,
} from "@/components/home/collection-section";
import { LazyCollections } from "@/components/home/lazy-collections";
import type { Locale } from "@/i18n/routing";
import {
  getHomeBanners,
  getHomeCollections,
  groupByQueuePosition,
} from "@/lib/api/home";
import { localeToLang } from "@/lib/i18n-lang";

export const revalidate = 120;

// Runs server-rendered into the initial document; the rest stream in through
// <LazyCollections> as compact JSON when the user scrolls near them.
const INITIAL_RUNS = 8;

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const lang = localeToLang[locale];

  const [banners, collections] = await Promise.all([
    getHomeBanners(),
    getHomeCollections(lang),
  ]);
  const runs = groupByQueuePosition(collections);

  return (
    <div className="mx-auto max-w-7xl space-y-14 px-4 py-8 sm:px-6 lg:px-8">
      <BannerCarousel banners={banners} />

      {runs.slice(0, INITIAL_RUNS).map((run) =>
        run.length === 1 ? (
          <CollectionSection key={run[0].id} collection={run[0]} />
        ) : (
          <CollectionRunRow key={run[0].id} run={run} />
        ),
      )}

      {runs.length > INITIAL_RUNS && (
        <LazyCollections lang={lang} offset={INITIAL_RUNS} />
      )}

      <AppPromo />
    </div>
  );
}
