"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import { api, apiErrorMessage, clearTokens, setOnUnauthorized, setTokens, TOKEN_KEYS } from "@/lib/api";
import { logout as apiLogout, register as apiRegister } from "@/lib/api-fns";
import type { AuthResponse, RegisterPayload, User } from "@/lib/types";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isHydrated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  setSession: (data: AuthResponse) => void;
  logout: () => Promise<void>;
  forceLogout: () => void;
  fetchProfile: () => Promise<void>;
  setUser: (user: User) => void;
  markHydrated: () => void;
}

setOnUnauthorized(() => {
  useAuthStore.getState().forceLogout();
});

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isHydrated: false,

      login: async (email, password) => {
        const data: AuthResponse = await api
          .post("/auth/login/", { email, password })
          .then((r) => r.data);
        setTokens(data.access, data.refresh);
        set({ user: data.user, accessToken: data.access });
      },

      register: async (payload) => {
        const data: AuthResponse = await apiRegister(payload);
        setTokens(data.access, data.refresh);
        set({ user: data.user, accessToken: data.access });
      },

      setSession: (data) => {
        setTokens(data.access, data.refresh);
        set({ user: data.user, accessToken: data.access });
      },

      logout: async () => {
        const refresh = window.localStorage.getItem(TOKEN_KEYS.refresh);
        try {
          if (refresh) await apiLogout(refresh);
        } catch {
          /* ignore network errors on logout */
        }
        clearTokens();
        set({ user: null, accessToken: null });
      },

      forceLogout: () => {
        clearTokens();
        set({ user: null, accessToken: null });
      },

      fetchProfile: async () => {
        try {
          const { data } = await api.get<User>("/auth/profile/");
          set({ user: data });
          window.localStorage.setItem(TOKEN_KEYS.user, JSON.stringify(data));
        } catch (err) {
          console.error(apiErrorMessage(err));
        }
      },

      setUser: (user) => set({ user }),
      markHydrated: () => set({ isHydrated: true }),
    }),
    {
      name: "libseat-auth",
      version: 2,
      partialize: (s) => ({ user: s.user }),
      migrate: (persisted) => {
        const state = (persisted ?? {}) as { user?: Partial<User> | null };
        const u = state.user;
        if (u && typeof u === "object" && typeof u.name === "string" && typeof u.email === "string") {
          return { ...state, user: u };
        }
        return { user: null };
      },
      onRehydrateStorage: () => (state) => state?.markHydrated(),
    }
  )
);
