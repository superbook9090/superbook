// src/store/useSessionStore.ts
// Global session store using Zustand to eliminate repeated API calls

import { create } from 'zustand';

interface SessionState {
  session: unknown;
  status: 'loading' | 'authenticated' | 'unauthenticated';
  setSession: (session: unknown) => void;
  setStatus: (status: 'loading' | 'authenticated' | 'unauthenticated') => void;
  clearSession: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  session: null,
  status: 'loading',
  setSession: (session) => set({ session }),
  setStatus: (status) => set({ status }),
  clearSession: () => set({ session: null, status: 'unauthenticated' }),
}));
