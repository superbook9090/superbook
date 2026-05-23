/** Central dashboard navigation config (i18n keys + routes). */

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
  | 'Newspaper';

export type NavFeatureFlag = 'enableBlogs' | 'enableQuizzes' | 'enableCourses';

export interface DashboardNavItem {
  /** i18n key, e.g. `common.dashboard` */
  nameKey: string;
  href: string;
  icon: NavIconName;
  feature?: NavFeatureFlag;
  superadminOnly?: boolean;
}

export const STUDENT_NAV: DashboardNavItem[] = [
  { nameKey: 'common.dashboard', href: '/dashboard/student', icon: 'LayoutDashboard' },
  { nameKey: 'common.myCourses', href: '/dashboard/student/courses', icon: 'BookOpen', feature: 'enableCourses' },
  { nameKey: 'common.browse', href: '/dashboard/student/browse', icon: 'Search', feature: 'enableCourses' },
  { nameKey: 'common.files', href: '/dashboard/student/files', icon: 'Folder' },
  { nameKey: 'common.blogs', href: '/dashboard/student/blogs', icon: 'Newspaper', feature: 'enableBlogs' },
  { nameKey: 'common.favorites', href: '/dashboard/student/favorites', icon: 'Heart', feature: 'enableBlogs' },
  { nameKey: 'common.quizzes', href: '/dashboard/student/quizzes', icon: 'HelpCircle', feature: 'enableQuizzes' },
  { nameKey: 'common.progress', href: '/dashboard/student/progress', icon: 'TrendingUp' },
  { nameKey: 'common.profile', href: '/dashboard/student/profile', icon: 'User' },
  { nameKey: 'contact.title', href: '/contact', icon: 'Mail' },
];

export const TEACHER_NAV: DashboardNavItem[] = [
  { nameKey: 'common.dashboard', href: '/dashboard/teacher', icon: 'LayoutDashboard' },
  { nameKey: 'common.myCourses', href: '/dashboard/teacher/courses', icon: 'BookOpen', feature: 'enableCourses' },
  { nameKey: 'common.quizzes', href: '/dashboard/teacher/quizzes', icon: 'HelpCircle', feature: 'enableQuizzes' },
  { nameKey: 'common.blogs', href: '/dashboard/teacher/blogs', icon: 'Newspaper', feature: 'enableBlogs' },
  { nameKey: 'common.analytics', href: '/dashboard/teacher/analytics', icon: 'BarChart3' },
  { nameKey: 'common.profile', href: '/dashboard/teacher/profile', icon: 'User' },
  { nameKey: 'contact.title', href: '/contact', icon: 'Mail' },
];

export const ADMIN_NAV: DashboardNavItem[] = [
  { nameKey: 'common.users', href: '/dashboard/admin/users', icon: 'Users' },
  { nameKey: 'common.organizations', href: '/dashboard/admin/organizations', icon: 'Building2', superadminOnly: true },
  { nameKey: 'common.allCourses', href: '/dashboard/admin/courses', icon: 'Library', feature: 'enableCourses' },
  { nameKey: 'common.allQuizzes', href: '/dashboard/admin/quizzes', icon: 'HelpCircle', feature: 'enableQuizzes' },
  { nameKey: 'common.allBlogs', href: '/dashboard/admin/blogs', icon: 'Newspaper', feature: 'enableBlogs' },
  { nameKey: 'common.files', href: '/dashboard/admin/files', icon: 'Folder', superadminOnly: true },
  { nameKey: 'common.analytics', href: '/dashboard/admin/analytics', icon: 'BarChart3' },
  { nameKey: 'common.notifications', href: '/dashboard/admin/notifications', icon: 'Bell', superadminOnly: true },
  { nameKey: 'common.settings', href: '/dashboard/admin/settings', icon: 'User' },
  { nameKey: 'common.profile', href: '/dashboard/admin/profile', icon: 'User' },
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
  features: Record<NavFeatureFlag, boolean>
): DashboardNavItem[] {
  return items.filter((item) => {
    if (item.feature) return features[item.feature];
    return true;
  });
}

export function filterAdminNav(items: DashboardNavItem[], isSuperAdmin: boolean): DashboardNavItem[] {
  return items.filter((item) => !item.superadminOnly || isSuperAdmin);
}
