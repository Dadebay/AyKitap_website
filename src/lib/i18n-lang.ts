import type { Locale } from "@/i18n/routing";
import type { Lang, MultiLang } from "./types";

// URL locale -> backend language code. The backend knows "tk", not "tm";
// never pass the raw URL locale to the data layer.
export const localeToLang: Record<Locale, Lang> = {
  tm: "tk",
  tr: "tr",
  ru: "ru",
};

/**
 * Repairs recurring data-entry damage before text reaches the DOM: ǧ/Ǧ
 * (g with caron) typed where Turkish ğ/Ğ was meant — Gilroy lacks the caron
 * pair, so the browser renders that one letter in a fallback font — plus C1
 * control chars (cp1252 mojibake) and NBSP.
 */
function fixGlyphs(value: string): string {
  return value
    .replace(/\u01E7/g, "\u011F") // g-caron -> Turkish g-breve
    .replace(/\u01E6/g, "\u011E")
    .replace(/[\u0080-\u009F]/g, "")
    .replace(/\u00A0/g, " ");
}

export function pickLang(value: MultiLang, lang: Lang): string {
  return fixGlyphs(value[lang] || value.tk || "");
}

/**
 * API text fields are jsonb server-side: usually already flattened to a plain
 * string, but some rows/endpoints hand back the whole {tk,tr,ru} object.
 * Never let one reach React as an object ("[object Object]"/crash).
 */
export function localizedText(value: unknown, lang: Lang): string {
  if (typeof value === "string") return fixGlyphs(value.trim());
  if (value && typeof value === "object") {
    const map = value as Record<string, unknown>;
    const candidate =
      map[lang] ?? map.tk ?? Object.values(map).find((v) => !!v);
    return typeof candidate === "string" ? fixGlyphs(candidate.trim()) : "";
  }
  return "";
}
