"use client";

import { Children } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

// Horizontal scroller used for all book/collection/series rows on the
// home page. Accepts pre-rendered (server) children and wraps each in a slide.
export function RowCarousel({
  children,
  itemClassName,
}: {
  children: React.ReactNode;
  itemClassName?: string;
}) {
  return (
    <Carousel
      opts={{ align: "start", dragFree: true, slidesToScroll: 2 }}
      className="group/row"
    >
      <CarouselContent className="-ml-3 sm:-ml-4">
        {Children.map(children, (child) => (
          <CarouselItem
            className={cn(
              "basis-[44%] pl-3 sm:basis-[30%] sm:pl-4 md:basis-[23%] lg:basis-[18.5%]",
              itemClassName,
            )}
          >
            {child}
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="-left-4 hidden size-10 border-border bg-card shadow-md transition-opacity disabled:opacity-0 md:flex lg:opacity-0 lg:group-hover/row:opacity-100 lg:disabled:group-hover/row:opacity-0" />
      <CarouselNext className="-right-4 hidden size-10 border-border bg-card shadow-md transition-opacity disabled:opacity-0 md:flex lg:opacity-0 lg:group-hover/row:opacity-100 lg:disabled:group-hover/row:opacity-0" />
    </Carousel>
  );
}
