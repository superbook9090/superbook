// src/store/useSessionStore.ts
// Global session store using Zustand to eliminate repeated API calls

import { create } from 'zustand';

export interface SessionUser {
  id: string;
  name?: string;
  email?: string;
  image?: string;
  role?: string;
  organizationId?: string;
}

export interface Session {
  user: SessionUser;
  expires: string;
}

export interface Blog {
  _id: string;
  title: string;
  topic: string;
  content: string;
  createdAt: string;
  author: { name: string };
}

export interface Favorite {
  _id: string;
  blog: Blog;
}

interface SessionState {
  session: Session | null;
  status: 'loading' | 'authenticated' | 'unauthenticated';
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
  CACHE_TIME: number; // 5 minutes
  favorites: Set<string>;
  favoritesData: Favorite[];
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
  favoritesData: [],
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
      const res = await fetch('/api/auth/session', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      const data = await res.json();

      if (data.user) {
        set({
          session: data,
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

    // Prevent duplicate calls
    if (state.favoritesLoading) return;

    // Use cache if fresh (5 minutes)
    if (state.favoritesLastFetched && now - state.favoritesLastFetched < CACHE_TIME) {
      return;
    }

    set({ favoritesLoading: true });

    try {
      const res = await fetch('/api/favorites');
      const data = await res.json();

      const favoriteIds = new Set<string>(data.favorites?.map((fav: Favorite) => fav.blog._id) || []);
      set({
        favorites: favoriteIds,
        favoritesData: data.favorites || [],
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
    await fetch('/api/auth/signout', { method: 'POST' });
    set({ session: null, status: 'unauthenticated', lastFetched: null, favorites: new Set(), favoritesData: [], favoritesLastFetched: null });
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
