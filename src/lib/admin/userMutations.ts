import { AdminAuthResult } from './adminAuth';

interface UserTargetDoc {
  _id: unknown;
  role?: string;
  organizationId?: unknown;
}

export function validateUserUpdate(
  targetUser: UserTargetDoc,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updates: Record<string, any>,
  sessionUserId: string,
  authResult: AdminAuthResult
): { error?: string; status?: number } {
  const userId = String(targetUser._id);

  // Cross-org check
  if (!authResult.isSuperAdmin) {
    const targetOrgId = targetUser.organizationId?.toString();
    if (targetOrgId !== authResult.organizationId?.toString()) {
      return { error: 'You can only update users from your organization', status: 403 };
    }
  }

  // Prevent changing own role
  if (userId === sessionUserId && updates.role && updates.role !== 'admin') {
    return { error: 'Cannot change your own role', status: 400 };
  }

  // Prevent suspending self
  if (userId === sessionUserId && updates.isSuspended) {
    return { error: 'Cannot suspend your own account', status: 400 };
  }

  // Prevent suspending other admins (only superadmin can do this)
  if (targetUser.role === 'admin' && updates.isSuspended && authResult.role !== 'superadmin') {
    return { error: 'Only super admins can suspend admin accounts', status: 403 };
  }

  // Validate booleans
  if (updates.canCreatePublicCourses !== undefined && typeof updates.canCreatePublicCourses !== 'boolean') {
    return { error: 'canCreatePublicCourses must be a boolean', status: 400 };
  }

  if (updates.canCreateContests !== undefined) {
    if (typeof updates.canCreateContests !== 'boolean') {
      return { error: 'canCreateContests must be a boolean', status: 400 };
    }
    if (!authResult.isSuperAdmin) {
      return { error: 'Only super admins can configure contest permissions', status: 403 };
    }
  }

  if (updates.canGenerateAiQuizzes !== undefined && typeof updates.canGenerateAiQuizzes !== 'boolean') {
    return { error: 'canGenerateAiQuizzes must be a boolean', status: 400 };
  }

  // Validate limits
  if (updates.limits) {
    const { courses, quizzes, blogs, aiQuizGenerations, aiQuizMaxQuestions } = updates.limits;
    if (courses !== undefined && (typeof courses !== 'number' || courses < 1)) {
      return { error: 'Courses limit must be a positive integer', status: 400 };
    }
    if (quizzes !== undefined && (typeof quizzes !== 'number' || quizzes < 1)) {
      return { error: 'Quizzes limit must be a positive integer', status: 400 };
    }
    if (blogs !== undefined && (typeof blogs !== 'number' || blogs < 1)) {
      return { error: 'Blogs limit must be a positive integer', status: 400 };
    }
    if (aiQuizGenerations !== undefined && (typeof aiQuizGenerations !== 'number' || aiQuizGenerations < 1)) {
      return { error: 'AI Quiz Generations limit must be a positive integer', status: 400 };
    }
    if (aiQuizMaxQuestions !== undefined && (typeof aiQuizMaxQuestions !== 'number' || aiQuizMaxQuestions < 1)) {
      return { error: 'AI Quiz Max Questions limit must be a positive integer', status: 400 };
    }
  }

  return {};
}

export function validateUserDeletion(
  targetUser: UserTargetDoc,
  sessionUserId: string,
  authResult: AdminAuthResult
): { error?: string; status?: number } {
  const userId = String(targetUser._id);

  // Self deletion prevention
  if (userId === sessionUserId) {
    return { error: 'Cannot delete your own account', status: 400 };
  }

  // Cross-org check
  if (!authResult.isSuperAdmin) {
    const targetOrgId = targetUser.organizationId?.toString();
    if (targetOrgId !== authResult.organizationId?.toString()) {
      return { error: 'You can only delete users from your organization', status: 403 };
    }
  }

  // Superadmin deletion prevention
  if (targetUser.role === 'superadmin') {
    return { error: 'Super admin accounts cannot be deleted', status: 403 };
  }

  // Admin deletion by non-superadmin prevention
  if (targetUser.role === 'admin' && !authResult.isSuperAdmin) {
    return { error: 'Only super admins can delete admin accounts', status: 403 };
  }

  return {};
}
