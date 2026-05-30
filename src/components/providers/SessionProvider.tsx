'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useSessionStore } from '@/store/useSessionStore';

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const needsSession = pathname.startsWith('/dashboard');
  const { fetchSession, fetchFavorites, status, session } = useSessionStore();
  const hasFetchedFavorites = useRef(false);
  const role = session?.user?.role;

  // Fetch once on app load (cached) so maintenance mode can detect admin sessions.
  useEffect(() => {
    void fetchSession();
  }, [fetchSession]);

  // Refresh session periodically on dashboard routes only.
  useEffect(() => {
    if (!needsSession) return;

    const sessionInterval = setInterval(() => {
      void fetchSession();
    }, 10 * 60 * 1000);

    return () => clearInterval(sessionInterval);
  }, [needsSession, fetchSession]);

  useEffect(() => {
    if (!needsSession) return;

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
      void fetchFavorites();
    }
  }, [needsSession, status, role, fetchFavorites]);

  return <>{children}</>;
}
