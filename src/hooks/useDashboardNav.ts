'use client';

import { useMemo } from 'react';
import { useFeature } from '@/contexts/AppSettingsContext';
import { useSettingsStore } from '@/store/useSettingsStore';
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
  const isLoading = useSettingsStore((s) => s.isLoading);
  const enableBlogs = useFeature('enableBlogs');
  const enableQuizzes = useFeature('enableQuizzes');
  const enableCourses = useFeature('enableCourses');
  const enableAnalytics = useFeature('enableAnalytics');
  const enableNotes = useFeature('enableNotes');

  const features = useMemo<Record<NavFeatureFlag, boolean>>(
    () => ({
      enableBlogs,
      enableQuizzes,
      enableCourses,
      enableAnalytics,
      enableNotes,
    }),
    [enableBlogs, enableQuizzes, enableCourses, enableAnalytics, enableNotes]
  );

  return useMemo(() => {
    let filtered = filterNavByFeatures(items, features, { hideWhileLoading: isLoading });
    if (options?.isSuperAdmin !== undefined) {
      filtered = filterAdminNav(filtered, options.isSuperAdmin);
    }
    return filtered;
  }, [items, features, isLoading, options?.isSuperAdmin]);
}
