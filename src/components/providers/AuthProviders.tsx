'use client';

import { AppSettingsProvider } from '@/contexts/AppSettingsContext';
import MaintenanceCheck from '@/components/MaintenanceCheck';

/** Settings + maintenance gate for auth pages (lighter than full dashboard stack). */
export default function AuthProviders({ children }: { children: React.ReactNode }) {
  return (
    <AppSettingsProvider>
      <MaintenanceCheck>{children}</MaintenanceCheck>
    </AppSettingsProvider>
  );
}
