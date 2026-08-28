"use client";

import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

const localeLabels: Record<Locale, string> = {
  tm: "Türkmen dili",
  tr: "Türkçe",
  ru: "Русский",
};

export function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function switchTo(next: Locale) {
    if (next === locale) return;
    const q = searchParams.toString();
    router.replace(q ? `${pathname}?${q}` : pathname, { locale: next });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-10 gap-1.5 rounded-full px-2.5"
          aria-label={localeLabels[locale]}
        >
          <Image
            src={`/flags/${locale}.svg`}
            alt={localeLabels[locale]}
            width={22}
            height={22}
            className="size-[22px] rounded-full object-cover ring-1 ring-border"
          />
          <span className="hidden text-sm font-medium uppercase lg:inline">
            {locale}
          </span>
          <ChevronDown className="size-3.5 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-44 rounded-xl">
        {routing.locales.map((l) => (
          <DropdownMenuItem
            key={l}
            onClick={() => switchTo(l)}
            className={cn(
              "gap-2.5 rounded-lg",
              l === locale && "bg-secondary text-secondary-foreground",
            )}
          >
            <Image
              src={`/flags/${l}.svg`}
              alt={localeLabels[l]}
              width={20}
              height={20}
              className={cn(
                "size-5 rounded-full object-cover",
                l === locale && "ring-2 ring-primary ring-offset-1",
              )}
            />
            {localeLabels[l]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
