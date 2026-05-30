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

  useEffect(() => {
    if (!needsSession) return;

    fetchSession();

    const sessionInterval = setInterval(() => {
      fetchSession();
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
      fetchFavorites();
    }
  }, [needsSession, status, role, fetchFavorites]);

  return <>{children}</>;
}
