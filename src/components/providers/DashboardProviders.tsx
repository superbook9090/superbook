'use client';

import { AppSettingsProvider } from '@/contexts/AppSettingsContext';
import MaintenanceCheck from '@/components/MaintenanceCheck';
import { QueryProvider } from '@/lib/react-query/QueryProvider';

/** Heavy client providers only for authenticated dashboard routes. */
export default function DashboardProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <AppSettingsProvider>
        <MaintenanceCheck>{children}</MaintenanceCheck>
      </AppSettingsProvider>
    </QueryProvider>
  );
}
