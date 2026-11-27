import { AdminAuthResult } from './adminAuth';
import {
  ORG_LIMIT_KEYS,
  ORG_PERMISSION_KEYS,
  type OrganizationPolicy,
} from './orgPolicy';

interface UserTargetDoc {
  _id: unknown;
  role?: string;
  organizationId?: unknown;
  limits?: Partial<Record<(typeof ORG_LIMIT_KEYS)[number], number>>;
}

const PERMISSION_LABELS: Record<(typeof ORG_PERMISSION_KEYS)[number], string> = {
  canUploadVideos: 'video upload permission',
  canCreatePublicCourses: 'public course creation permission',
  canCreateContests: 'contest creation permission',
  canGenerateAiQuizzes: 'AI quiz generation permission',
};

const LIMIT_LABELS: Record<(typeof ORG_LIMIT_KEYS)[number], string> = {
  courses: 'Courses',
  quizzes: 'Quizzes',
  blogs: 'Blogs',
  aiQuizGenerations: 'AI Quiz Generations',
  aiQuizMaxQuestions: 'AI Quiz Max Questions',
};

export function validateUserUpdate(
  targetUser: UserTargetDoc,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updates: Record<string, any>,
  sessionUserId: string,
  authResult: AdminAuthResult,
  orgPolicy?: OrganizationPolicy | null
): { error?: string; status?: number } {
  const userId = String(targetUser._id);

  // Cross-org check
  if (!authResult.isSuperAdmin) {
    const targetOrgId = targetUser.organizationId?.toString();
    if (!authResult.organizationId || targetOrgId !== authResult.organizationId.toString()) {
      return { error: 'You can only update users from your organization', status: 403 };
    }
  }

  // Prevent changing own role
  if (userId === sessionUserId && updates.role && updates.role !== 'admin') {
    return { error: 'Cannot change your own role', status: 400 };
  }

  // Prevent non-superadmins from promoting anyone to superadmin
  if (!authResult.isSuperAdmin && updates.role === 'superadmin') {
    return { error: 'Only super admins can assign super admin role', status: 403 };
  }

  // Prevent suspending self
  if (userId === sessionUserId && updates.isSuspended) {
    return { error: 'Cannot suspend your own account', status: 400 };
  }

  // Prevent suspending other admins (only superadmin can do this)
  if (targetUser.role === 'admin' && updates.isSuspended && authResult.role !== 'superadmin') {
    return { error: 'Only super admins can suspend admin accounts', status: 403 };
  }

  // Validate teacher feature permission toggles against superadmin-granted organization permissions
  for (const key of ORG_PERMISSION_KEYS) {
    if (updates[key] !== undefined) {
      if (typeof updates[key] !== 'boolean') {
        return { error: `${key} must be a boolean`, status: 400 };
      }
      if (!authResult.isSuperAdmin && !orgPolicy?.permissions?.[key]) {
        return {
          error: `Super admin has not enabled ${PERMISSION_LABELS[key]} for your organization`,
          status: 403,
        };
      }
    }
  }

  // Validate teacher content & AI quotas against superadmin-granted organization quota ceilings
  if (updates.limits !== undefined) {
    if (updates.limits === null || typeof updates.limits !== 'object' || Array.isArray(updates.limits)) {
      return { error: 'limits must be an object', status: 400 };
    }

    for (const key of ORG_LIMIT_KEYS) {
      const val = updates.limits[key];
      if (val === undefined || val === null) continue;

      if (typeof val !== 'number' || !Number.isInteger(val) || val < 1) {
        return { error: `${LIMIT_LABELS[key]} limit must be a positive integer`, status: 400 };
      }
      if (key === 'aiQuizMaxQuestions' && val > 50) {
        return { error: 'AI Quiz Max Questions limit cannot exceed 50', status: 400 };
      }

      if (!authResult.isSuperAdmin) {
        const orgMax = orgPolicy?.teacherLimits?.[key];
        const unchangedExisting = targetUser.limits?.[key] === val;
        if (orgMax === undefined || orgMax === null) {
          if (!unchangedExisting) {
            return {
              error: `Super admin has not granted a custom ${LIMIT_LABELS[key].toLowerCase()} quota for your organization`,
              status: 403,
            };
          }
        } else if (val > orgMax) {
          return {
            error: `${LIMIT_LABELS[key]} limit cannot exceed your organization quota (${orgMax})`,
            status: 400,
          };
        }
      }
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
