'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAppSettings } from '@/contexts/AppSettingsContext';
import { getDashboardHomePath } from '@/lib/roles';
import { getRequiredFeatureForPath, isDashboardFeaturePath } from '@/lib/featureRoutes';

type FeatureRouteGuardProps = {
  role?: string;
};

/** Redirects away from dashboard routes when the required feature toggle is off. */
export default function FeatureRouteGuard({ role }: FeatureRouteGuardProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isLoading, isFeatureEnabled } = useAppSettings();

  useEffect(() => {
    if (!pathname || isLoading || !isDashboardFeaturePath(pathname)) {
      return;
    }

    const requiredFeature = getRequiredFeatureForPath(pathname);
    if (!requiredFeature || isFeatureEnabled(requiredFeature)) {
      return;
    }

    router.replace(getDashboardHomePath(role));
  }, [pathname, isLoading, isFeatureEnabled, role, router]);

  return null;
}
