'use client';

import { QueryProvider } from '@/lib/react-query/QueryProvider';

/** Heavy client providers only for authenticated dashboard routes. */
export default function DashboardProviders({ children }: { children: React.ReactNode }) {
  return <QueryProvider>{children}</QueryProvider>;
}
