"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  apiLogout,
  ApiError,
  getMe,
  mapApiUser,
  sendCode,
  updateProfile,
  verifyLogin,
  type ApiUser,
} from "@/lib/api/client";
import { useLibraryStore } from "./library-store";
import { useWishlistStore } from "./wishlist-store";

interface AuthState {
  user: ApiUser | null;
  accessToken: string | null;
  /** Full phone in +993XXXXXXXX form while the OTP step is pending. */
  pendingPhone: string | null;
  pendingUsername: string | null;
  /** Sends the OTP. `digits` = 8-digit local number. Throws ApiError. */
  requestOtp: (digits: string, username?: string) => Promise<void>;
  /** Verifies the OTP (login == signup). Throws ApiError (404 = wrong code). */
  verifyOtp: (code: string) => Promise<ApiUser>;
  refreshMe: () => Promise<void>;
  setUser: (user: ApiUser) => void;
  logout: () => void;
  /** Clears local session without calling the API (used on 401). */
  forceLogout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      pendingPhone: null,
      pendingUsername: null,

      requestOtp: async (digits, username) => {
        const phone = `+993${digits}`;
        await sendCode(phone);
        set({ pendingPhone: phone, pendingUsername: username?.trim() || null });
      },

      verifyOtp: async (code) => {
        const { pendingPhone, pendingUsername } = get();
        if (!pendingPhone) throw new ApiError(0, "no-pending-phone");
        const { user, accessToken } = await verifyLogin(
          pendingPhone,
          Number(code),
        );
        let finalUser = user;
        // Signup collects a username; the backend only accepts it after login.
        if (pendingUsername && !user.username) {
          try {
            finalUser = await updateProfile(accessToken, {
              username: pendingUsername,
            });
          } catch {
            finalUser = { ...user, username: pendingUsername };
          }
        }
        finalUser = mapApiUser(finalUser);
        set({
          user: finalUser,
          accessToken,
          pendingPhone: null,
          pendingUsername: null,
        });
        return finalUser;
      },

      refreshMe: async () => {
        const token = get().accessToken;
        if (!token) return;
        try {
          set({ user: mapApiUser(await getMe(token)) });
        } catch (e) {
          if (e instanceof ApiError && e.status === 401) get().forceLogout();
        }
      },

      setUser: (user) => set({ user: mapApiUser(user) }),

      logout: () => {
        const token = get().accessToken;
        if (token) apiLogout(token).catch(() => {});
        set({ user: null, accessToken: null });
        useWishlistStore.getState().reset();
        useLibraryStore.getState().reset();
      },

      forceLogout: () => {
        set({ user: null, accessToken: null });
        useWishlistStore.getState().reset();
        useLibraryStore.getState().reset();
      },
    }),
    {
      // v2: real API session {user, accessToken} (was mock before)
      name: "aykitap-auth-v2",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ user: s.user, accessToken: s.accessToken }),
    },
  ),
);
