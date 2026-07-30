/** Central dashboard navigation config (i18n keys + routes). */

import { ROUTES } from '@/constants/routes';

export type NavIconName =
  | 'LayoutDashboard'
  | 'BookOpen'
  | 'Search'
  | 'HelpCircle'
  | 'TrendingUp'
  | 'User'
  | 'BarChart3'
  | 'Users'
  | 'Library'
  | 'Building2'
  | 'Folder'
  | 'Mail'
  | 'Bell'
  | 'Heart'
  | 'Newspaper'
  | 'Award';

export type NavFeatureFlag = 'enableBlogs' | 'enableQuizzes' | 'enableCourses' | 'enableAnalytics';

export interface DashboardNavItem {
  /** i18n key, e.g. `common.dashboard` */
  nameKey: string;
  href: string;
  icon: NavIconName;
  feature?: NavFeatureFlag;
  superadminOnly?: boolean;
}

export const STUDENT_NAV: DashboardNavItem[] = [
  { nameKey: 'common.dashboard', href: ROUTES.student.root, icon: 'LayoutDashboard' },
  { nameKey: 'common.myCourses', href: ROUTES.student.courses, icon: 'BookOpen', feature: 'enableCourses' },
  { nameKey: 'common.browse', href: ROUTES.student.browse, icon: 'Search', feature: 'enableCourses' },
  { nameKey: 'common.files', href: ROUTES.student.files, icon: 'Folder' },
  { nameKey: 'common.blogs', href: ROUTES.student.blogs, icon: 'Newspaper', feature: 'enableBlogs' },
  { nameKey: 'common.favorites', href: ROUTES.student.favorites, icon: 'Heart', feature: 'enableBlogs' },
  { nameKey: 'common.quizzes', href: ROUTES.student.quizzes, icon: 'HelpCircle', feature: 'enableQuizzes' },
  { nameKey: 'common.progress', href: ROUTES.student.progress, icon: 'TrendingUp' },
  { nameKey: 'common.certificates', href: ROUTES.student.certificates, icon: 'Award', feature: 'enableCourses' },
  { nameKey: 'common.profile', href: ROUTES.student.profile, icon: 'User' },
  { nameKey: 'contact.title', href: ROUTES.contact, icon: 'Mail' },
];

export const TEACHER_NAV: DashboardNavItem[] = [
  { nameKey: 'common.dashboard', href: ROUTES.teacher.root, icon: 'LayoutDashboard' },
  { nameKey: 'common.myCourses', href: ROUTES.teacher.courses, icon: 'BookOpen', feature: 'enableCourses' },
  { nameKey: 'common.quizzes', href: ROUTES.teacher.quizzes, icon: 'HelpCircle', feature: 'enableQuizzes' },
  { nameKey: 'common.blogs', href: ROUTES.teacher.blogs, icon: 'Newspaper', feature: 'enableBlogs' },
  { nameKey: 'common.analytics', href: ROUTES.teacher.analytics, icon: 'BarChart3', feature: 'enableAnalytics' },
  { nameKey: 'common.profile', href: ROUTES.teacher.profile, icon: 'User' },
  { nameKey: 'contact.title', href: ROUTES.contact, icon: 'Mail' },
];

export const ADMIN_NAV: DashboardNavItem[] = [
  { nameKey: 'common.users', href: ROUTES.admin.users, icon: 'Users' },
  { nameKey: 'common.organizations', href: ROUTES.admin.organizations, icon: 'Building2', superadminOnly: true },
  { nameKey: 'common.allCourses', href: ROUTES.admin.courses, icon: 'Library', feature: 'enableCourses' },
  { nameKey: 'common.allQuizzes', href: ROUTES.admin.quizzes, icon: 'HelpCircle', feature: 'enableQuizzes' },
  { nameKey: 'common.allBlogs', href: ROUTES.admin.blogs, icon: 'Newspaper', feature: 'enableBlogs' },
  { nameKey: 'common.files', href: ROUTES.admin.files, icon: 'Folder', superadminOnly: true },
  { nameKey: 'common.analytics', href: ROUTES.admin.analytics, icon: 'BarChart3', feature: 'enableAnalytics' },
  { nameKey: 'common.notifications', href: ROUTES.admin.notifications, icon: 'Bell', superadminOnly: true },
  { nameKey: 'common.settings', href: ROUTES.admin.settings, icon: 'User' },
  { nameKey: 'common.profile', href: ROUTES.admin.profile, icon: 'User' },
];

/** Primary items shown in mobile bottom bar (max 5). */
export const MOBILE_BOTTOM_NAV_KEYS = [
  'common.dashboard',
  'common.myCourses',
  'common.browse',
  'common.quizzes',
  'common.profile',
] as const;

export function filterNavByFeatures(
  items: DashboardNavItem[],
  features: Record<NavFeatureFlag, boolean>,
  options?: { hideWhileLoading?: boolean }
): DashboardNavItem[] {
  return items.filter((item) => {
    if (!item.feature) return true;
    if (options?.hideWhileLoading) return false;
    return features[item.feature];
  });
}

export function filterAdminNav(items: DashboardNavItem[], isSuperAdmin: boolean): DashboardNavItem[] {
  return items.filter((item) => !item.superadminOnly || isSuperAdmin);
}
