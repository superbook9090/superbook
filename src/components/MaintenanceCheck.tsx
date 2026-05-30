'use client';

import { ROUTES } from '@/constants/routes';
import { useAppSettings } from '@/contexts/AppSettingsContext';
import { isAdmin, getDashboardHomePath } from '@/lib/roles';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { useSessionStore } from '@/store/useSessionStore';

interface MaintenanceCheckProps {
  children: React.ReactNode;
}

export default function MaintenanceCheck({ children }: MaintenanceCheckProps) {
  const { settings, isLoading } = useAppSettings();
  const { session, status } = useSessionStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;

    const maintenanceMode = settings?.platformConfig.maintenanceMode ?? false;

    if (isAdmin(session?.user?.role)) return;

    if (pathname === ROUTES.maintenance && !maintenanceMode) {
      if (status === 'loading') return;

      const home = session?.user?.role
        ? getDashboardHomePath(session.user.role)
        : ROUTES.login;
      router.replace(home);
      return;
    }

    if (pathname === ROUTES.maintenance || pathname === ROUTES.login) return;

    if (maintenanceMode) {
      router.replace(ROUTES.maintenance);
    }
  }, [settings, isLoading, session, status, router, pathname]);

  return <>{children}</>;
}
