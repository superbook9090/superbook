'use client';

import { useMemo } from 'react';
import { useFeature } from '@/contexts/AppSettingsContext';
import {
  filterAdminNav,
  filterNavByFeatures,
  type DashboardNavItem,
  type NavFeatureFlag,
} from '@/constants/navigation';

export function useDashboardNav(
  items: DashboardNavItem[],
  options?: { isSuperAdmin?: boolean }
): DashboardNavItem[] {
  const enableBlogs = useFeature('enableBlogs');
  const enableQuizzes = useFeature('enableQuizzes');
  const enableCourses = useFeature('enableCourses');

  const features = useMemo<Record<NavFeatureFlag, boolean>>(
    () => ({
      enableBlogs,
      enableQuizzes,
      enableCourses,
    }),
    [enableBlogs, enableQuizzes, enableCourses]
  );

  return useMemo(() => {
    let filtered = filterNavByFeatures(items, features);
    if (options?.isSuperAdmin !== undefined) {
      filtered = filterAdminNav(filtered, options.isSuperAdmin);
    }
    return filtered;
  }, [items, features, options?.isSuperAdmin]);
}
