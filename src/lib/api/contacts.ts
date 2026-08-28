// Contact info entered in the admin panel (single `contacts` row, public GET).
// Fail-soft like the rest of the server fetchers: no data -> everything null,
// and the footer simply hides the block.
import { apiFetch } from "./http";

interface RawContact {
  tg_name: string | null;
  start_name: string | null;
  phone: string | null;
  email: string | null;
  instagram: string | null;
  privacy_link: string | null;
  user_aggreement_link: string | null;
}

export interface ContactInfo {
  /** Display name of the company/app as entered in the admin. */
  name: string | null;
  phone: string | null;
  phoneHref: string | null;
  email: string | null;
  telegram: string | null;
  telegramHref: string | null;
  instagram: string | null;
  instagramHref: string | null;
  /** External legal links; when set they replace the built-in pages. */
  privacyLink: string | null;
  termsLink: string | null;
  /** True when there is at least one way to reach us. */
  hasAny: boolean;
}

function clean(value: string | null | undefined): string | null {
  const v = value?.trim();
  return v ? v : null;
}

function externalLink(value: string | null | undefined): string | null {
  const v = clean(value);
  if (!v) return null;
  return /^https?:\/\//i.test(v) ? v : `https://${v}`;
}

/** "@aykitap" | "aykitap" | "https://t.me/aykitap" -> handle + t.me link. */
function telegram(value: string | null | undefined) {
  const v = clean(value);
  if (!v) return { handle: null, href: null };
  const handle = v
    .replace(/^https?:\/\/(t\.me|telegram\.me)\//i, "")
    .replace(/^@/, "")
    .replace(/\/+$/, "");
  if (!handle) return { handle: null, href: null };
  return { handle: `@${handle}`, href: `https://t.me/${handle}` };
}

/** "@aykitap" | "aykitap" | "https://instagram.com/aykitap" -> handle + link. */
function instagram(value: string | null | undefined) {
  const v = clean(value);
  if (!v) return { handle: null, href: null };
  const handle = v
    .replace(/^https?:\/\/(www\.)?instagram\.com\//i, "")
    .replace(/^@/, "")
    .replace(/\/+$/, "");
  if (!handle) return { handle: null, href: null };
  return { handle: `@${handle}`, href: `https://instagram.com/${handle}` };
}

export async function getContactInfo(): Promise<ContactInfo> {
  const raw = await apiFetch<RawContact>("/contacts", undefined, 120);
  const phone = clean(raw?.phone);
  const email = clean(raw?.email);
  const tg = telegram(raw?.tg_name);
  const ig = instagram(raw?.instagram);

  return {
    name: clean(raw?.start_name),
    phone,
    phoneHref: phone ? `tel:${phone.replace(/[^\d+]/g, "")}` : null,
    email,
    telegram: tg.handle,
    telegramHref: tg.href,
    instagram: ig.handle,
    instagramHref: ig.href,
    privacyLink: externalLink(raw?.privacy_link),
    termsLink: externalLink(raw?.user_aggreement_link),
    hasAny: Boolean(phone || email || tg.handle || ig.handle),
  };
}
