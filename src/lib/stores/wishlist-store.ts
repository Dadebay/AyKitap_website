"use client";

import { create } from "zustand";
import {
  fetchWishlist,
  likeBook,
  unlikeBook,
  type WishlistEntry,
} from "@/lib/api/client";
import type { BookDto, BookSnapshot, Lang } from "@/lib/types";

// Server-backed wishlist for logged-in users. Not persisted — the backend
// (liked_books) is the source of truth; state is hydrated per session.

function snapshotToBook(s: BookSnapshot): BookDto {
  return {
    id: s.id,
    name: s.name,
    description: "",
    image: s.image ?? "",
    age: 0,
    year: 0,
    page_count: 0,
    price: s.price ?? 0,
    is_subscription_only: false,
    recomended: false,
    top_of_the_week: false,
    view_count: 0,
    download_count: 0,
    authors: s.authors
      ? [{ id: 0, name: s.authors, bio: "", image: null }]
      : [],
    genres: [],
    formats: [],
  };
}

interface WishlistState {
  items: WishlistEntry[];
  loaded: boolean;
  loading: boolean;
  /** Language the current items were fetched in (localized book fields). */
  lang: Lang | null;
  ensureLoaded: (token: string, lang: Lang) => Promise<void>;
  /** Optimistic toggle. Resolves to true when the book ended up liked.
   * Throws ApiError (after rolling back) so callers can handle 401. */
  toggle: (book: BookSnapshot, token: string) => Promise<boolean>;
  reset: () => void;
}

export const useWishlistStore = create<WishlistState>()((set, get) => ({
  items: [],
  loaded: false,
  loading: false,
  lang: null,

  // Refetches when the UI language changes so localized book fields follow it;
  // the old items stay visible until the new ones arrive.
  ensureLoaded: async (token, lang) => {
    const state = get();
    if (state.loading) return;
    if (state.loaded && state.lang === lang) return;
    set({ loading: true });
    try {
      const items = await fetchWishlist(token, lang);
      set({ items, loaded: true, loading: false, lang });
    } catch (e) {
      set({ loading: false });
      throw e;
    }
  },

  toggle: async (book, token) => {
    const prev = get().items;
    const exists = prev.some((i) => i.book.id === book.id);

    if (exists) {
      set({ items: prev.filter((i) => i.book.id !== book.id) });
      try {
        await unlikeBook(token, book.id);
      } catch (e) {
        set({ items: prev });
        throw e;
      }
      return false;
    }

    set({
      items: [{ book: snapshotToBook(book), liked_book_id: null }, ...prev],
    });
    try {
      await likeBook(token, book.id);
    } catch (e) {
      set({ items: prev });
      throw e;
    }
    return true;
  },

  reset: () => set({ items: [], loaded: false, loading: false, lang: null }),
}));
