"use client";

import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { FilterOption } from "@/lib/api/catalog";
import { FilterPanel } from "./filter-panel";

export function FilterSheet({
  genres,
  languages,
}: {
  genres: FilterOption[];
  languages: FilterOption[];
}) {
  const t = useTranslations("catalog");
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="rounded-full lg:hidden">
          <SlidersHorizontal className="size-4" />
          {t("filters")}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full max-w-sm overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{t("filters")}</SheetTitle>
        </SheetHeader>
        <div className="px-4 pb-8">
          <FilterPanel
            genres={genres}
            languages={languages}
            onApply={() => setOpen(false)}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
