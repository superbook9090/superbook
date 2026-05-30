// src/store/useSessionStore.ts
// Global session store using Zustand to eliminate repeated API calls

import { create } from 'zustand';
import type { Session } from '@/types';
import { authSignOut, fetchAuthSessionJson } from '@/lib/api/auth';
import { listFavoriteIds } from '@/lib/api/favorites';
import { clearStoredDeviceRegistration } from '@/lib/notifications/push/deviceRegistrationStorage';

interface SessionState {
  session: Session | null;
  status: 'loading' | 'authenticated' | 'unauthenticated';
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
  CACHE_TIME: number; // 5 minutes
  favorites: Set<string>;
  favoritesLoading: boolean;
  favoritesLastFetched: number | null;
  fetchSession: (force?: boolean) => Promise<void>;
  fetchFavorites: () => Promise<void>;
  setSession: (session: Session | null) => void;
  setStatus: (status: 'loading' | 'authenticated' | 'unauthenticated') => void;
  clearSession: () => void;
  logout: () => Promise<void>;
  addFavorite: (blogId: string) => void;
  removeFavorite: (blogId: string) => void;
}

const CACHE_TIME = 5 * 60 * 1000; // 5 minutes

export const useSessionStore = create<SessionState>((set, get) => ({
  session: null,
  status: 'loading',
  loading: false,
  error: null,
  lastFetched: null,
  CACHE_TIME,
  favorites: new Set<string>(),
  favoritesLoading: false,
  favoritesLastFetched: null,

  fetchSession: async (force = false) => {
    const state = get();
    const now = Date.now();

    // Prevent duplicate calls
    if (state.loading) return;

    // Use cache if fresh (unless forced)
    if (!force && state.session && state.lastFetched && now - state.lastFetched < CACHE_TIME) {
      set({ status: 'authenticated' });
      return;
    }

    set({ loading: true, error: null });

    try {
      const data = await fetchAuthSessionJson();

      if (data.user) {
        set({
          session: data as unknown as Session,
          status: 'authenticated',
          loading: false,
          lastFetched: now,
          error: null,
        });
      } else {
        set({
          session: null,
          status: 'unauthenticated',
          loading: false,
          lastFetched: now,
          error: null,
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch session';
      set({
        session: null,
        status: 'unauthenticated',
        loading: false,
        error: errorMessage,
      });
    }
  },

  fetchFavorites: async () => {
    const state = get();
    const now = Date.now();

    if (state.session?.user?.role !== 'student') {
      return;
    }

    if (state.favoritesLoading) return;

    if (state.favoritesLastFetched && now - state.favoritesLastFetched < CACHE_TIME) {
      return;
    }

    set({ favoritesLoading: true });

    try {
      const ids = await listFavoriteIds();
      set({
        favorites: new Set(ids),
        favoritesLoading: false,
        favoritesLastFetched: now,
      });
    } catch (err) {
      console.error('Error fetching favorites:', err);
      set({ favoritesLoading: false });
    }
  },

  setSession: (session) => set({ session, lastFetched: Date.now() }),
  setStatus: (status) => set({ status }),
  clearSession: () => set({ session: null, status: 'unauthenticated', lastFetched: null }),

  logout: async () => {
    await authSignOut();
    clearStoredDeviceRegistration();
    set({
      session: null,
      status: 'unauthenticated',
      lastFetched: null,
      favorites: new Set(),
      favoritesLastFetched: null,
    });
  },

  addFavorite: (blogId: string) => {
    const state = get();
    const newFavorites = new Set(state.favorites);
    newFavorites.add(blogId);
    set({ favorites: newFavorites });
  },

  removeFavorite: (blogId: string) => {
    const state = get();
    const newFavorites = new Set(state.favorites);
    newFavorites.delete(blogId);
    set({ favorites: newFavorites });
  },
}));
