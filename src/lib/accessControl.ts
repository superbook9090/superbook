import mongoose from 'mongoose';

/**
 * User interface for access control
 */
export interface AccessUser {
  _id: mongoose.Types.ObjectId;
  organizationId?: mongoose.Types.ObjectId | null;
  role: 'student' | 'teacher' | 'admin' | 'superadmin';
}

/**
 * Get access filter based on user's organization
 *
 * Rules:
 * - Superadmin: full access (no filter)
 * - Admin (with org): ONLY their org courses (not public)
 * - Admin (without org): ONLY public courses
 * - Student/Teacher with org: public + own org
 * - Student/Teacher without org: public only
 *
 * @param user - The user object containing organizationId and role
 * @returns MongoDB query filter object
 */
export function getAccessFilter(user: AccessUser): Record<string, unknown> {
  if (!user) return {};

  if (user.role === 'superadmin') {
    return {};
  }

  if (user.role === 'admin') {
    if (user.organizationId) {
      return { organizationId: user.organizationId };
    }

    return {
      $or: [
        { organizationId: null },
        { organizationId: { $exists: false } }
      ]
    };
  }

  // student / teacher
  if (user.organizationId) {
    return {
      $or: [
        { organizationId: user.organizationId },
        { organizationId: null },
        { organizationId: { $exists: false } }
      ]
    };
  }

  return {
    $or: [
      { organizationId: null },
      { organizationId: { $exists: false } }
    ]
  };
}

/**
 * Check if user has access to a specific content item
 *
 * @param contentOrganizationId - The organizationId of the content item
 * @param user - The user object
 * @returns true if user has access, false otherwise
 * @throws Error if access is denied
 */
export function checkContentAccess(
  contentOrganizationId: mongoose.Types.ObjectId | null | undefined,
  user: AccessUser
): boolean {
  // Superadmin has access to all content
  if (user.role === 'superadmin') {
    return true;
  }

  // If content is public (no organization), everyone has access
  if (!contentOrganizationId) {
    return true;
  }

  // If user has no organization, they cannot access restricted content
  if (!user.organizationId) {
    return false;
  }

  // User can access content if they belong to the same organization
  return user.organizationId.toString() === contentOrganizationId.toString();
}

/**
 * Validate single item access and throw error if denied
 *
 * @param contentOrganizationId - The organizationId of the content item
 * @param user - The user object
 * @param contentType - Type of content (for error message)
 * @throws Error if access is denied
 */
export function validateContentAccess(
  contentOrganizationId: mongoose.Types.ObjectId | null | undefined,
  user: AccessUser,
  contentType: string = 'content'
): void {
  if (!checkContentAccess(contentOrganizationId, user)) {
    throw new Error(`You do not have permission to access this ${contentType}`);
  }
}

/**
 * Check if admin can access a specific organization's resources
 * Admin can only access resources from their own organization
 * Superadmin can access any organization
 *
 * @param targetOrganizationId - The organizationId to check access for
 * @param user - The user object
 * @returns true if admin has access, false otherwise
 */
export function checkAdminOrgAccess(
  targetOrganizationId: mongoose.Types.ObjectId | null | undefined,
  user: AccessUser
): boolean {
  // Superadmin can access any organization
  if (user.role === 'superadmin') {
    return true;
  }

  // Only admins can use this function
  if (user.role !== 'admin') {
    return false;
  }

  // Admin must have an organization
  if (!user.organizationId) {
    return false;
  }

  // Admin can only access their own organization
  if (!targetOrganizationId) {
    return false;
  }

  return user.organizationId.toString() === targetOrganizationId.toString();
}

/**
 * Validate admin organization access and throw error if denied
 *
 * @param targetOrganizationId - The organizationId to check access for
 * @param user - The user object
 * @param resourceType - Type of resource (for error message)
 * @throws Error if access is denied
 */
export function validateAdminOrgAccess(
  targetOrganizationId: mongoose.Types.ObjectId | null | undefined,
  user: AccessUser,
  resourceType: string = 'resource'
): void {
  if (!checkAdminOrgAccess(targetOrganizationId, user)) {
    throw new Error(`You do not have permission to access this ${resourceType}`);
  }
}
