const ROLE_HIERARCHY: Record<string, number> = {
  student: 1,
  teacher: 2,
  admin: 3,
  superadmin: 4,
};

type UserRole = 'student' | 'teacher' | 'admin' | 'superadmin';

function hasAccess(userRole: string | null | undefined, requiredRole: UserRole): boolean {
  if (!userRole) return false;
  const userLevel = ROLE_HIERARCHY[userRole] || 0;
  const requiredLevel = ROLE_HIERARCHY[requiredRole] || 0;
  return userLevel >= requiredLevel;
}

export function isAdmin(userRole: string | null | undefined): boolean {
  return hasAccess(userRole, 'admin');
}

export function isSuperAdmin(userRole: string | null | undefined): boolean {
  return userRole === 'superadmin';
}
