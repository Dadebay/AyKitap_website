"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

export function ExpandableText({ text }: { text: string }) {
  const t = useTranslations("book");
  const [expanded, setExpanded] = useState(false);

  return (
    <div>
      <p
        className={
          expanded
            ? "leading-relaxed text-foreground/80"
            : "line-clamp-3 leading-relaxed text-foreground/80"
        }
      >
        {text}
      </p>
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="mt-1.5 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
      >
        {expanded ? t("showLess") : t("readMore")}
      </button>
    </div>
  );
}
