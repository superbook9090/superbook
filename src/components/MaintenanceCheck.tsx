'use client';
import { ROUTES } from '@/constants/routes';

import { useAppSettings } from '@/contexts/AppSettingsContext';
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
    if (isLoading || !settings) return;

    // Skip check if session is loading
    if (status === 'loading') return;

    // Skip check if user is admin
    if (session?.user?.role === 'admin') return;

    // If on maintenance page and maintenance mode is now OFF, redirect to dashboard
    if (pathname === '/maintenance' && !settings.platformConfig.maintenanceMode) {
      if (session?.user?.role === 'teacher') {
        router.push(ROUTES.teacher.root);
      } else if (session?.user?.role === 'student') {
        router.push(ROUTES.student.root);
      } else if (session?.user?.role === 'admin') {
        router.push(ROUTES.admin.settings);
      } else {
        router.push(ROUTES.login);
      }
      return;
    }

    // Skip check if already on maintenance page or login page
    if (pathname === '/maintenance' || pathname === '/login') return;

    // If maintenance mode is enabled, redirect to maintenance page
    if (settings.platformConfig.maintenanceMode) {
      router.push(ROUTES.maintenance);
    }
  }, [settings, isLoading, session, status, router, pathname]);

  return <>{children}</>;
}
