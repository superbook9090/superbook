// src/lib/roles.ts
// Role hierarchy system for permission checks

export const ROLE_HIERARCHY: Record<string, number> = {
  student: 1,
  teacher: 2,
  admin: 3,
  superadmin: 4,
};

export type UserRole = 'student' | 'teacher' | 'admin' | 'superadmin';

/**
 * Check if a user has access based on role hierarchy
 * @param userRole - The user's current role
 * @param requiredRole - The minimum required role
 * @returns true if user has access, false otherwise
 */
export function hasAccess(userRole: string | null | undefined, requiredRole: UserRole): boolean {
  if (!userRole) return false;
  const userLevel = ROLE_HIERARCHY[userRole] || 0;
  const requiredLevel = ROLE_HIERARCHY[requiredRole] || 0;
  return userLevel >= requiredLevel;
}

/**
 * Check if user is an admin or superadmin
 * @param userRole - The user's current role
 * @returns true if user is admin or superadmin
 */
export function isAdmin(userRole: string | null | undefined): boolean {
  return hasAccess(userRole, 'admin');
}

/**
 * Check if user is a superadmin
 * @param userRole - The user's current role
 * @returns true if user is superadmin
 */
export function isSuperAdmin(userRole: string | null | undefined): boolean {
  return userRole === 'superadmin';
}

/**
 * Check if user is a teacher or higher
 * @param userRole - The user's current role
 * @returns true if user is teacher, admin, or superadmin
 */
export function isTeacherOrHigher(userRole: string | null | undefined): boolean {
  return hasAccess(userRole, 'teacher');
}
