"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Link } from "@/i18n/navigation";
import type { ApiBanner } from "@/lib/api/home";
import { cn } from "@/lib/utils";

function BannerSlide({ banner }: { banner: ApiBanner }) {
  if (!banner.website_image) return null;

  const image = (
    <Image
      src={banner.website_image}
      alt={banner.name}
      fill
      sizes="(max-width: 768px) 92vw, 60vw"
      className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
    />
  );
  const frame =
    "group relative block aspect-16/8 overflow-hidden rounded-3xl bg-muted sm:aspect-16/7";

  // Tap rule (per mobile spec): book_id -> book page; else link -> open; else inert.
  if (banner.book_id) {
    return (
      <Link href={`/books/${banner.book_id}`} className={frame}>
        {image}
      </Link>
    );
  }
  if (banner.link?.startsWith("http")) {
    return (
      <a
        href={banner.link}
        target="_blank"
        rel="noopener noreferrer"
        className={frame}
      >
        {image}
      </a>
    );
  }
  return <div className={frame}>{image}</div>;
}

export function BannerCarousel({ banners }: { banners: ApiBanner[] }) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) return;
    const onSelect = () => setCurrent(api.selectedScrollSnap());
    onSelect();
    api.on("select", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  const visible = banners.filter((b) => b.website_image);
  if (visible.length === 0) return null;

  return (
    <div>
      <Carousel setApi={setApi} opts={{ align: "start", loop: true }}>
        <CarouselContent className="-ml-4">
          {visible.map((b) => (
            <CarouselItem
              key={b.id}
              className="basis-full pl-4 md:basis-4/5 lg:basis-3/5"
            >
              <BannerSlide banner={b} />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
      {visible.length > 1 && (
        <div className="mt-4 flex justify-center gap-1.5">
          {visible.map((b, i) => (
            <button
              key={b.id}
              type="button"
              onClick={() => api?.scrollTo(i)}
              aria-label={b.name || String(i + 1)}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                i === current
                  ? "w-6 bg-primary"
                  : "w-1.5 bg-foreground/15 hover:bg-foreground/30",
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
