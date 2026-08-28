// Browser-side API calls that carry the user's Bearer token (auth, wishlist,
// profile). Server-side/anonymous fetching lives in http.ts; this module
// throws ApiError instead of failing soft so the UI can react (401 -> logout).
import type { BookDto, BookFileDto, Lang } from "@/lib/types";
import { mapListItemToBookDto, type RawBookListItem } from "./home";
import { resolveMediaUrl } from "./http";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export interface ApiUser {
  id: number;
  phone: string;
  username: string | null;
  image: string | null;
  balance: number;
}

interface FetchOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  token?: string;
  lang?: Lang;
}

async function clientFetch<T>(
  path: string,
  { method = "GET", body, token, lang }: FetchOptions = {},
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(lang ? { "Accept-Language": lang } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, "network");
  }

  const json = await res.json().catch(() => null);
  if (!res.ok) {
    // Nest error bodies: {message: string | string[], error, statusCode}
    const raw = json?.message;
    const message = Array.isArray(raw) ? raw[0] : (raw ?? "request-failed");
    throw new ApiError(res.status, String(message));
  }
  return (json?.data ?? json) as T;
}

// ---- Live search (header dropdown; public, no token) ----

export async function searchBooksLive(
  query: string,
  lang: Lang,
): Promise<BookDto[]> {
  const data = await clientFetch<{ items: RawBookListItem[] }>(
    `/books/all?page=1&size=6&search=${encodeURIComponent(query)}`,
    { lang },
  );
  return (data?.items ?? []).map((b) => mapListItemToBookDto(b, lang));
}

// ---- Auth ----

export async function sendCode(phone: string): Promise<void> {
  await clientFetch("/users/send-code", { method: "POST", body: { phone } });
}

export async function verifyLogin(
  phone: string,
  code: number,
): Promise<{ user: ApiUser; accessToken: string }> {
  // clientType "web" is mandatory: the default ("mobile") would revoke the
  // user's phone-app session.
  return clientFetch("/users/verify-login", {
    method: "POST",
    body: { phone, code, clientType: "web" },
  });
}

export async function getMe(token: string): Promise<ApiUser> {
  return clientFetch("/users/me", { token });
}

export async function updateProfile(
  token: string,
  body: { username?: string; image?: string },
): Promise<ApiUser> {
  return clientFetch("/users", { method: "PATCH", body, token });
}

// Multipart upload can't go through clientFetch (it JSON-stringifies the
// body); the browser must set the Content-Type boundary itself.
export async function uploadImage(token: string, file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  let res: Response;
  try {
    res = await fetch(`${API_URL}/files/upload-custom`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
  } catch {
    throw new ApiError(0, "network");
  }
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    throw new ApiError(res.status, String(json?.message ?? "upload-failed"));
  }
  // The files controller wraps its own {success, data} inside the global
  // {statusCode, message, data} envelope.
  const path = json?.data?.data?.path;
  if (typeof path !== "string" || !path) {
    throw new ApiError(500, "upload-failed");
  }
  return path;
}

export async function apiLogout(token: string): Promise<void> {
  await clientFetch("/users/logout", { method: "POST", body: {}, token });
}

// ---- Wishlist (liked books) ----

export async function likeBook(token: string, bookId: number): Promise<void> {
  await clientFetch(`/books/${bookId}/like`, {
    method: "POST",
    body: {},
    token,
  });
}

export async function unlikeBook(
  token: string,
  bookId: number,
): Promise<void> {
  await clientFetch(`/books/${bookId}/like`, { method: "DELETE", token });
}

export interface WishlistEntry {
  book: BookDto;
  liked_book_id: number | null;
}

/** Fetches the complete wishlist, paging through size=100 chunks. */
export async function fetchWishlist(
  token: string,
  lang: Lang,
): Promise<WishlistEntry[]> {
  const out: WishlistEntry[] = [];
  for (let page = 1; ; page++) {
    const data = await clientFetch<{
      items: (RawBookListItem & { liked_book_id: number })[];
      totalCount: number;
    }>(`/books/all?wants_to=true&page=${page}&size=100`, { token, lang });
    out.push(
      ...data.items.map((i) => ({
        book: mapListItemToBookDto(i, lang),
        liked_book_id: i.liked_book_id ?? null,
      })),
    );
    if (out.length >= data.totalCount || data.items.length === 0) break;
  }
  return out;
}

// ---- Library (purchases + downloads) ----

export interface BuyResult {
  success: boolean;
  already_bought: boolean;
  /** Balance after the purchase, straight from the server. */
  balance: number;
}

/** Pays for the book out of the balance. Free books land here too (price 0). */
export async function buyBook(
  token: string,
  bookId: number,
): Promise<BuyResult> {
  return clientFetch(`/books/${bookId}/buy`, {
    method: "POST",
    body: {},
    token,
  });
}

/** Fetches every purchased book, paging through size=100 chunks. */
export async function fetchBoughtBooks(
  token: string,
  lang: Lang,
): Promise<BookDto[]> {
  const out: BookDto[] = [];
  for (let page = 1; ; page++) {
    const data = await clientFetch<{
      items: RawBookListItem[];
      totalCount: number;
    }>(`/books/all?bought=true&page=${page}&size=100`, { token, lang });
    out.push(...data.items.map((b) => mapListItemToBookDto(b, lang)));
    if (out.length >= data.totalCount || data.items.length === 0) break;
  }
  return out;
}

/** Book files are only on the detail endpoint — fetched lazily for downloads. */
export async function fetchBookFiles(
  bookId: number,
  lang: Lang,
): Promise<BookFileDto[]> {
  const b = await clientFetch<{
    bookFiles:
      | {
          id: number;
          file_key: string | null;
          file_format: string | null;
          file_size: number | null;
        }[]
      | null;
  }>(`/books/${bookId}`, { lang });
  return (b.bookFiles ?? [])
    .filter((f) => !!f.file_key)
    .map((f) => ({
      id: f.id,
      file_key: f.file_key as string,
      format: (f.file_format ?? "").toUpperCase(),
      size: f.file_size ?? 0,
    }));
}

export interface FileLink {
  url: string;
  size: number;
  name: string;
}

/** Short-lived presigned download link; 403 when the book is not owned. */
export async function getFileLink(
  token: string,
  fileKey: string,
): Promise<FileLink> {
  return clientFetch(`/books/file?filename=${encodeURIComponent(fileKey)}`, {
    token,
  });
}

// ---- Balance ----

export type BalanceEvent =
  | "DEPOSIT_BY_CARD"
  | "DEPOSIT_BY_TMCELL"
  | "DEPOSIT_BY_PROMO"
  | "BUY_BOOK"
  | "BUY_SUBSCRIPTION"
  | "REWARD_BY_STREAK";

export interface BalanceLog {
  id: number;
  created_at: string;
  amount: number;
  event: BalanceEvent;
  book_id: number | null;
  /** Flattened server-side by Accept-Language; may still be a jsonb object. */
  book_name?: unknown;
}

export async function fetchBalanceLogs(
  token: string,
  lang: Lang,
): Promise<BalanceLog[]> {
  return clientFetch("/users/balance-logs", { token, lang });
}

/** Redeems a promo code: 404 = unknown code, 400 = already used. */
export async function redeemPromo(
  token: string,
  promoCode: string,
): Promise<void> {
  await clientFetch("/users/promo-codes", {
    method: "POST",
    body: { promo_code: promoCode },
    token,
  });
}

// ---- Card top-up (balance deposit via bank) ----

export interface PaymentBank {
  id: number;
  name: string;
}

/** Admin toggle: when false, hide the card top-up UI. */
export async function fetchPaymentsActive(): Promise<boolean> {
  const data = await clientFetch<{ is_active?: boolean } | null>(
    "/payments/is-active",
  );
  return !!data?.is_active;
}

export async function fetchBanks(): Promise<PaymentBank[]> {
  const data = await clientFetch<PaymentBank[]>("/payments/banks");
  return Array.isArray(data) ? data : [];
}

/**
 * Creates a top-up order and returns the bank's hosted payment page URL.
 * Redirect the browser there; the bank sends the user back to
 * /profile/balance?payment=success|failed after paying.
 */
export async function createTopUpOrder(
  token: string,
  amount: number,
  bankId: number,
): Promise<string> {
  const data = await clientFetch<{ invoiceUrl?: string }>("/payments/orders", {
    method: "POST",
    body: { amount, bank_id: bankId },
    token,
  });
  if (!data?.invoiceUrl) throw new ApiError(500, "payment-failed");
  return data.invoiceUrl;
}

// ---- Book requests (suggests) ----

export type SuggestStatus =
  | "new"
  | "accepted"
  | "processing"
  | "completed"
  | "rejected";

export type SuggestLanguage = "tk" | "tr" | "ru" | "en" | "other";

export interface Suggest {
  id: number;
  created_at: string;
  name: string;
  author: string | null;
  description: string | null;
  language: SuggestLanguage | null;
  status: SuggestStatus;
}

export async function fetchMySuggests(token: string): Promise<Suggest[]> {
  return clientFetch("/suggests/my", { token });
}

/** 400 "Maximum of 5 suggests per day exceeded" when the daily cap is hit. */
export async function createSuggest(
  token: string,
  body: {
    name: string;
    author?: string;
    description?: string;
    language?: SuggestLanguage;
  },
): Promise<Suggest> {
  return clientFetch("/suggests", { method: "POST", body, token });
}

export async function deleteSuggest(
  token: string,
  id: number,
): Promise<void> {
  await clientFetch(`/suggests/${id}`, { method: "DELETE", token });
}

// ---- Problem reports ----

export async function reportProblem(
  token: string,
  problem: string,
): Promise<void> {
  await clientFetch("/problems", { method: "POST", body: { problem }, token });
}

export function mapApiUser(u: ApiUser): ApiUser {
  return { ...u, image: resolveMediaUrl(u.image) };
}
