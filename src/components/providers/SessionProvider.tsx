'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useSessionStore } from '@/store/useSessionStore';
import UsernameModal from '@/components/auth/UsernameModal';

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const needsSession = pathname.startsWith('/dashboard');
  const { fetchSession, fetchFavorites, status, session } = useSessionStore();
  const hasFetchedFavorites = useRef(false);
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const role = session?.user?.role;

  // Fetch once on app load (cached) so maintenance mode can detect admin sessions.
  useEffect(() => {
    void fetchSession();
  }, [fetchSession]);

  // Check if phone registered user needs to choose a name
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      const isNewPhoneReg = localStorage.getItem('quizdo_new_phone_reg') === 'true';
      const isDefaultPhoneUser = session.user.name === 'Phone User' && session.user.phone;
      if (isNewPhoneReg || isDefaultPhoneUser) {
        setShowUsernameModal(true);
      }
    }
  }, [status, session]);

  const handleCloseModal = () => {
    localStorage.removeItem('quizdo_new_phone_reg');
    setShowUsernameModal(false);
  };

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

  return (
    <>
      {children}
      {showUsernameModal && session?.user && (
        <UsernameModal
          currentName={session.user.name || ''}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
}
