'use client';

import { useEffect, useRef } from 'react';
import { useSessionStore } from '@/store/useSessionStore';

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const { fetchSession, fetchFavorites, status, session } = useSessionStore();
  const hasFetchedFavorites = useRef(false);
  const role = session?.user?.role;

  useEffect(() => {
    // Fetch session on mount
    fetchSession();

    // Optional: Auto-refresh session every 10 minutes
    const sessionInterval = setInterval(() => {
      fetchSession();
    }, 10 * 60 * 1000); // 10 minutes

    return () => clearInterval(sessionInterval);
  }, [fetchSession]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      hasFetchedFavorites.current = false;
      return;
    }
    if (
      status === 'authenticated' &&
      role === 'student' &&
      !hasFetchedFavorites.current
    ) {
      hasFetchedFavorites.current = true;
      fetchFavorites();
    }
  }, [status, role, fetchFavorites]);

  // Never block first paint — session resolves in the background (improves LCP / INP).
  return <>{children}</>;
}
