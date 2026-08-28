"use client";

import { create } from "zustand";
import { fetchBoughtBooks } from "@/lib/api/client";
import type { BookDto, Lang } from "@/lib/types";

// Server-backed library (user_bought_books). Like the wishlist store this is
// NOT persisted — the backend is the source of truth and it is hydrated once
// per session, then kept in sync locally after a purchase.

interface LibraryState {
  items: BookDto[];
  loaded: boolean;
  loading: boolean;
  /** Language the current items were fetched in (localized book fields). */
  lang: Lang | null;
  ensureLoaded: (token: string, lang: Lang) => Promise<void>;
  /** Re-fetches even when already loaded (after a purchase). */
  reload: (token: string, lang: Lang) => Promise<void>;
  owns: (bookId: number) => boolean;
  /** Optimistically records a fresh purchase so the UI flips immediately. */
  markBought: (book: BookDto) => void;
  reset: () => void;
}

export const useLibraryStore = create<LibraryState>()((set, get) => ({
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
    await get().reload(token, lang);
  },

  reload: async (token, lang) => {
    set({ loading: true });
    try {
      const items = await fetchBoughtBooks(token, lang);
      set({ items, loaded: true, loading: false, lang });
    } catch (e) {
      set({ loading: false });
      throw e;
    }
  },

  owns: (bookId) => get().items.some((b) => b.id === bookId),

  markBought: (book) =>
    set((s) =>
      s.items.some((b) => b.id === book.id)
        ? s
        : { items: [book, ...s.items] },
    ),

  reset: () => set({ items: [], loaded: false, loading: false, lang: null }),
}));
