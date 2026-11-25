'use client';

import { useState, useEffect, useCallback } from 'react';
import { ROUTES } from '@/constants/routes';
import {
  ADMIN_NAV,
  STUDENT_NAV,
  TEACHER_NAV,
  type DashboardNavItem,
} from '@/constants/navigation';
import { isAdmin, isStaffRole } from '@/lib/roles';

export interface SidebarNavGroup {
  id: string;
  labelKey: string;
  items: DashboardNavItem[];
}

const ROOT_DASHBOARD_PATHS = new Set<string>([
  ROUTES.student.root,
  ROUTES.teacher.root,
  ROUTES.admin.root,
]);

/**
 * Smart active-route matcher: exact match for dashboard home routes,
 * prefix match for nested routes (e.g. `/dashboard/admin/courses/123`).
 */
export function isNavItemActive(pathname: string, href: string): boolean {
  if (!href) return false;
  if (pathname === href) return true;
  if (ROOT_DASHBOARD_PATHS.has(href)) return false;
  return pathname.startsWith(`${href}/`);
}

const EXTRA_NAV_ITEMS: readonly DashboardNavItem[] = [
  { nameKey: 'common.notifications', href: ROUTES.student.notifications, icon: 'Bell' },
];

/** Resolves the active navigation item for breadcrumbs in desktop and mobile top bars. */
export function resolveActiveNavItem(pathname: string, role?: string): DashboardNavItem | null {
  const candidates: DashboardNavItem[] = isAdmin(role)
    ? [...ADMIN_NAV, ...TEACHER_NAV, ...EXTRA_NAV_ITEMS]
    : isStaffRole(role)
      ? [...TEACHER_NAV, ...EXTRA_NAV_ITEMS]
      : [...STUDENT_NAV, ...EXTRA_NAV_ITEMS];

  return candidates.find((item) => isNavItemActive(pathname, item.href)) ?? null;
}

export function isDashboardHomePath(pathname: string): boolean {
  return ROOT_DASHBOARD_PATHS.has(pathname);
}

interface GroupSpec {
  id: string;
  labelKey: string;
  keys: readonly string[];
}

function buildGroups(items: DashboardNavItem[], specs: readonly GroupSpec[]): SidebarNavGroup[] {
  const byKey = new Map<string, DashboardNavItem>();
  for (const item of items) {
    byKey.set(item.nameKey, item);
  }

  const used = new Set<string>();
  const groups: SidebarNavGroup[] = [];

  for (const spec of specs) {
    const groupItems: DashboardNavItem[] = [];
    for (const key of spec.keys) {
      const found = byKey.get(key);
      if (found) {
        groupItems.push(found);
        used.add(key);
      }
    }
    if (groupItems.length > 0) {
      groups.push({ id: spec.id, labelKey: spec.labelKey, items: groupItems });
    }
  }

  const leftovers = items.filter((item) => !used.has(item.nameKey));
  if (leftovers.length > 0) {
    const target = groups[groups.length - 1];
    if (target) {
      target.items.push(...leftovers);
    } else {
      groups.push({ id: 'other', labelKey: 'sidebar.overview', items: leftovers });
    }
  }

  return groups;
}

const STUDENT_SPECS: readonly GroupSpec[] = [
  {
    id: 'overview',
    labelKey: 'sidebar.overview',
    keys: ['common.dashboard', 'common.progress', 'common.certificates'],
  },
  {
    id: 'learning',
    labelKey: 'sidebar.learning',
    keys: ['common.myCourses', 'common.browse', 'common.quizzes', 'common.contests', 'common.mistakes'],
  },
  {
    id: 'library',
    labelKey: 'sidebar.library',
    keys: ['common.notes', 'common.files', 'common.blogs', 'common.favorites'],
  },
  {
    id: 'account',
    labelKey: 'sidebar.account',
    keys: ['common.profile', 'contact.title'],
  },
];

const TEACHER_SPECS: readonly GroupSpec[] = [
  {
    id: 'overview',
    labelKey: 'sidebar.overview',
    keys: ['common.dashboard', 'common.analytics', 'common.progress'],
  },
  {
    id: 'teaching',
    labelKey: 'sidebar.teaching',
    keys: ['common.myCourses', 'common.quizzes', 'common.contests', 'common.blogs', 'common.notes'],
  },
  {
    id: 'account',
    labelKey: 'sidebar.account',
    keys: ['common.profile', 'contact.title'],
  },
];

const ADMIN_SPECS: readonly GroupSpec[] = [
  {
    id: 'overview',
    labelKey: 'sidebar.overview',
    keys: ['common.dashboard', 'common.analytics', 'common.progress'],
  },
  {
    id: 'management',
    labelKey: 'sidebar.management',
    keys: ['common.users', 'common.organizations', 'common.notifications', 'common.settings'],
  },
  {
    id: 'content',
    labelKey: 'sidebar.content',
    keys: [
      'common.allCourses',
      'common.allQuizzes',
      'common.contests',
      'admin.challenges',
      'common.allBlogs',
      'admin.videoManagement',
      'common.files',
      'common.notes',
    ],
  },
  {
    id: 'account',
    labelKey: 'sidebar.account',
    keys: ['common.profile'],
  },
];

export function groupStudentNav(items: DashboardNavItem[]): SidebarNavGroup[] {
  return buildGroups(items, STUDENT_SPECS);
}

export function groupTeacherNav(items: DashboardNavItem[]): SidebarNavGroup[] {
  return buildGroups(items, TEACHER_SPECS);
}

export function groupAdminNav(items: DashboardNavItem[]): SidebarNavGroup[] {
  return buildGroups(items, ADMIN_SPECS);
}

const COLLAPSED_STORAGE_KEY = 'quizdo_sidebar_collapsed';

export function useSidebarCollapsed() {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(COLLAPSED_STORAGE_KEY);
      if (saved === 'true') setCollapsed(true);
    } catch {
      /* ignore storage errors */
    }
  }, []);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(COLLAPSED_STORAGE_KEY, String(next));
      } catch {
        /* ignore storage errors */
      }
      return next;
    });
  }, []);

  return { collapsed, toggleCollapsed };
}
