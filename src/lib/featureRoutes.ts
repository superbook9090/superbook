import { ROUTES } from '@/constants/routes';
import type { FeatureToggleKey } from '@/store/useSettingsStore';

type FeatureRouteRule = {
  prefix: string;
  feature: FeatureToggleKey;
};

const DASHBOARD_FEATURE_ROUTES: FeatureRouteRule[] = [
  { prefix: ROUTES.student.courses, feature: 'enableCourses' },
  { prefix: ROUTES.student.browse, feature: 'enableCourses' },
  { prefix: ROUTES.teacher.courses, feature: 'enableCourses' },
  { prefix: ROUTES.admin.courses, feature: 'enableCourses' },
  { prefix: ROUTES.student.blogs, feature: 'enableBlogs' },
  { prefix: ROUTES.student.favorites, feature: 'enableBlogs' },
  { prefix: ROUTES.teacher.blogs, feature: 'enableBlogs' },
  { prefix: ROUTES.admin.blogs, feature: 'enableBlogs' },
  { prefix: ROUTES.student.quizzes, feature: 'enableQuizzes' },
  { prefix: ROUTES.teacher.quizzes, feature: 'enableQuizzes' },
  { prefix: ROUTES.admin.quizzes, feature: 'enableQuizzes' },
  { prefix: '/dashboard/quizzes', feature: 'enableQuizzes' },
  { prefix: ROUTES.teacher.analytics, feature: 'enableAnalytics' },
  { prefix: ROUTES.admin.analytics, feature: 'enableAnalytics' },
];

const PUBLIC_FEATURE_ROUTES: FeatureRouteRule[] = [
  { prefix: ROUTES.blogs, feature: 'enableBlogs' },
  { prefix: ROUTES.courses, feature: 'enableCourses' },
];

const ALL_FEATURE_ROUTES = [...DASHBOARD_FEATURE_ROUTES, ...PUBLIC_FEATURE_ROUTES].sort(
  (a, b) => b.prefix.length - a.prefix.length
);

function matchesPrefix(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

/** Returns the feature toggle required for a path, or null if unrestricted. */
export function getRequiredFeatureForPath(pathname: string): FeatureToggleKey | null {
  for (const rule of ALL_FEATURE_ROUTES) {
    if (matchesPrefix(pathname, rule.prefix)) {
      return rule.feature;
    }
  }
  return null;
}

export function isDashboardFeaturePath(pathname: string): boolean {
  return DASHBOARD_FEATURE_ROUTES.some((rule) => matchesPrefix(pathname, rule.prefix));
}
