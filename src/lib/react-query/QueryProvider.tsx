'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import { useSessionStore } from '@/store/useSessionStore';

const ReactQueryDevtools =
  process.env.NODE_ENV === 'development'
    ? dynamic(
        () =>
          import('@tanstack/react-query-devtools').then((mod) => mod.ReactQueryDevtools),
        { ssr: false }
      )
    : () => null;

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            gcTime: 10 * 60 * 1000, // 10 minutes
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  // Clear all client-cached queries whenever the authenticated user or organization changes
  // to prevent cross-account or cross-tenant data leakage in shared browsers.
  const sessionScopeKey = useSessionStore((s) => {
    const userId = s.session?.user?.id || '';
    const orgId = s.session?.user?.organizationId || '';
    const role = s.session?.user?.role || '';
    return userId ? `${userId}:${role}:${orgId}` : 'anonymous';
  });
  const prevScopeRef = useRef<string>(sessionScopeKey);

  useEffect(() => {
    if (prevScopeRef.current !== sessionScopeKey) {
      if (prevScopeRef.current !== 'anonymous') {
        queryClient.clear();
      }
      prevScopeRef.current = sessionScopeKey;
    }
  }, [sessionScopeKey, queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
