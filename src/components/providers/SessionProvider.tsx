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

  // Show loading state while session is being fetched
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--student-primary)]"></div>
      </div>
    );
  }

  return <>{children}</>;
}
