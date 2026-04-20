// src/components/dashboard/SessionSync.tsx
// Component to sync NextAuth session to Zustand store
'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useSessionStore } from '@/store/useSessionStore';

export default function SessionSync() {
  const { data: session, status } = useSession();
  const setSession = useSessionStore((s) => s.setSession);
  const setStatus = useSessionStore((s) => s.setStatus);

  useEffect(() => {
    setStatus(status);
    if (status === 'authenticated') {
      setSession(session);
    }
  }, [status, session, setSession, setStatus]);

  return null;
}
