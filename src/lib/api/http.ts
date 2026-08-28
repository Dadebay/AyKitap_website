import type { Lang } from "@/lib/types";

// Server-side fetches can bypass the public HTTPS proxy and hit the backend
// directly over loopback (API_URL_INTERNAL); the browser bundle only ever
// sees NEXT_PUBLIC_API_URL.
const API_URL = process.env.API_URL_INTERNAL ?? process.env.NEXT_PUBLIC_API_URL;
const FILE_URL = process.env.NEXT_PUBLIC_FILE_URL;

interface ApiEnvelope<T> {
  statusCode: number;
  message: string;
  data: T;
}

/**
 * Server-side fetch against the real API. Unwraps the {statusCode, message,
 * data} envelope. Fail-soft: any network/HTTP/parse error returns null —
 * home sections are content, not a critical flow.
 */
export async function apiFetch<T>(
  path: string,
  lang?: Lang,
  revalidate = 120,
): Promise<T | null> {
  if (!API_URL) return null;
  try {
    const res = await fetch(`${API_URL}${path}`, {
      headers: lang ? { "Accept-Language": lang } : undefined,
      next: { revalidate },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as ApiEnvelope<T>;
    return json.data ?? null;
  } catch {
    return null;
  }
}

/** "/public/foo.jpg" -> "http://host:9000/public/foo.jpg"; null stays null.
 * Other writers (the mobile app) store avatars in looser shapes — absolute
 * minio URLs or bare object names — so canonicalize everything onto FILE_URL:
 * that keeps next/image's host allowlist satisfied and survives host moves. */
export function resolveMediaUrl(path: string | null | undefined): string | null {
  const value = path?.trim();
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) {
    try {
      const { pathname } = new URL(value);
      if (/^\/(public|private|audio)\//.test(pathname)) {
        return `${FILE_URL ?? ""}${pathname}`;
      }
    } catch {
      // fall through to returning the raw value
    }
    return value;
  }
  // Stored keys normally start with "/"; be forgiving about the ones that
  // don't so next/image never receives a relative src. Bare object names
  // (no bucket segment) live in the public bucket.
  const withSlash = value.startsWith("/") ? value : `/${value}`;
  return `${FILE_URL ?? ""}${
    /^\/(public|private|audio)\//.test(withSlash) ? withSlash : `/public${withSlash}`
  }`;
}
