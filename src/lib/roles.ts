const ROLE_HIERARCHY: Record<string, number> = {
  student: 1,
  teacher: 2,
  admin: 3,
  superadmin: 4,
};

export type UserRole = 'student' | 'teacher' | 'admin' | 'superadmin';

export function normalizeRole(role: string | null | undefined): UserRole {
  const normalized = (role || 'student').toLowerCase();
  if (normalized === 'teacher' || normalized === 'admin' || normalized === 'superadmin') {
    return normalized;
  }
  return 'student';
}

function hasAccess(userRole: string | null | undefined, requiredRole: UserRole): boolean {
  if (!userRole) return false;
  const userLevel = ROLE_HIERARCHY[normalizeRole(userRole)] || 0;
  const requiredLevel = ROLE_HIERARCHY[requiredRole] || 0;
  return userLevel >= requiredLevel;
}

export function isStaffRole(role: string | null | undefined): boolean {
  const normalized = normalizeRole(role);
  return normalized === 'teacher' || isAdmin(normalized);
}

export function isAdmin(userRole: string | null | undefined): boolean {
  return hasAccess(userRole, 'admin');
}

export function isSuperAdmin(userRole: string | null | undefined): boolean {
  return normalizeRole(userRole) === 'superadmin';
}

/** Default dashboard landing route for a role. */
export function getDashboardHomePath(role: string | null | undefined): string {
  const normalized = normalizeRole(role);
  if (normalized === 'teacher') return '/dashboard/teacher';
  if (isAdmin(normalized)) return '/dashboard/admin';
  return '/dashboard/student';
}

/** Ensure the dashboard nav item points at the role-appropriate home route. */
export function withDashboardHome<T extends { nameKey: string; href: string }>(
  items: T[],
  role: string | null | undefined
): T[] {
  const homePath = getDashboardHomePath(role);
  return items.map((item) =>
    item.nameKey === 'common.dashboard' ? { ...item, href: homePath } : item
  );
}
